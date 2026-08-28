import prisma from "../model/db.js";
import { Prisma } from "@prisma/client";
import { createAuditLog } from "../lib/others.js";
import redis from '../lib/redis.js';

// Invalidate all cached pages for a given user after any write operation
const invalidateFeedbackCache = async (userId) => {
  const patterns = [
    `feedbacks:p*:l*:o*:u${userId}`,  // logged-in user's pages
    `feedbacks:p*:l*:o*:uguest`       // guest pages also stale
  ];
  for (const pattern of patterns) {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  }
};

const getFeedback = async (req, res) => {
  try {
    const { id } = req.user;
    console.log("userId", id);

    const feedback = await prisma.feedback.findUnique({
      where: {
        user_id: BigInt(id)
      },
      exclude: {
        userRef: true
      }
    });
    console.log(feedback);
    // if (!feedback) return res.status(404).json({ success: false, message: "Feedback not found!" });
    return res.status(200).json({ success: true, data: feedback });
  }
  catch (error) {
    return res.status(500).json({ success: false, message: "Unable to find any feedback for now, please try again later!", error: error.message });
  }
}

const createFeedback = async (req, res) => {
  try {
    console.log("create fedback ", req.params)
    const { content, rating } = req.body;
    const authUserId = req.user.id;
    const feedback = await prisma.feedback.create({
      data: {
        user_id: BigInt(authUserId),
        content: content,
        rating: Number(rating) || 5
      }
    });
    // Fire-and-forget: audit log + cache invalidation
    createAuditLog({
      table_name: "Feedback",
      record_id: feedback.id,
      action: "CREATE",
      updated_data: { content, rating },
      user_id: authUserId,
      role: req.user.role,
      ip_address: req.ip,
      device: req.headers['user-agent']
    });
    invalidateFeedbackCache(authUserId).catch(console.error);
    return res.status(201).json({ success: true, message: "Your feedback is added, thank you for your feedback" });
  }
  catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Unable to create feedback", error: error.message });
  }
}

const getAllFeedbacks = async (req, res) => {
  try {
    const order = req.query.order === 'asc' ? 'ASC' : 'DESC';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 4;
    const offset = (page - 1) * limit;
    const loggedInUserId = req.user?.id ? BigInt(req.user.id) : null;

    const cacheKey = `feedbacks:p${page}:l${limit}:o${order}:u${loggedInUserId ?? 'guest'}`;
    const cached = await redis.get(cacheKey);
    if (cached) return res.status(200).json(JSON.parse(cached));

    const rows = await prisma.$queryRaw`
      SELECT
        f.id, f.user_id, f.rating, f.content, f.created_at, f.updated_at,
        u.full_name, u.image
      FROM "Feedback" f LEFT JOIN "Users" u ON u.id = f.user_id
      ORDER BY
        (f.user_id = ${loggedInUserId}) DESC,   -- pin logged-in user's row first
        f.created_at ${Prisma.raw(order)}
      LIMIT  ${limit}
      OFFSET ${offset}
    `;

    const [totalRow] = await prisma.$queryRaw`SELECT COUNT(*)::int AS total FROM "Feedback"`;
    const total = totalRow.total;
    const hasMore = page * limit < total;

    console.log("rows ", rows);

    let myFeedback = null;
    let feedbacks = null;

    if (page === 1 && loggedInUserId) {
      const myIdx = rows.findIndex(f => f.user_id === loggedInUserId);
      if (myIdx !== -1) {
        myFeedback = rows[myIdx];
      }
      // Always filter — when myIdx is -1, no row is removed (all rows kept)
      feedbacks = rows.filter((_, i) => i !== myIdx);
    }
    else {
      feedbacks = rows;
    }

    const payload = {
      success: true, page, limit, total, hasMore,
      myFeedback,
      feedbacks
    };

    await redis.set(cacheKey, JSON.stringify(payload), 'EX', 60);
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const obj = {};
    ["content", "rating"].forEach((key) => {
      let value = req.body[key];
      if (value !== undefined) {
        if (key === "rating") obj[key] = Number(value);
        else obj[key] = value;
      }
    })
    // Ensure the feedback exists and caller is owner (or admin)
    const existing = await prisma.feedback.findUnique({ where: { id: BigInt(req.params.id) } });
    if (!existing) return res.status(404).json({ success: false, message: 'Feedback not found' });

    const callerId = req.user?.id;
    const isOwner = callerId && String(existing.user_id) === String(callerId);
    const isAdmin = req.user?.role === 'ADMIN';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Not authorized to update this feedback' });

    const feedback = await prisma.feedback.update({ where: { id: BigInt(req.params.id) }, data: obj });

    // Convert BigInt fields to strings for JSON serialization
    const feedbackData = {
      ...feedback,
      id: feedback.id.toString(),
      user_id: feedback.user_id?.toString() || null
    };

    // Fire-and-forget: audit log + cache invalidation
    createAuditLog({
      table_name: "Feedback",
      record_id: feedback.id,
      action: "UPDATE",
      previous_data: existing,
      updated_data: obj,
      user_id: callerId,
      role: req.user?.role,
      ip_address: req.ip,
      device: req.headers['user-agent']
    });
    invalidateFeedbackCache(callerId).catch(console.error);

    return res.status(200).json({ success: true, message: "Updated successfully !", data: feedbackData });
  }
  catch (error) {
    return res.status(500).json({ success: false, message: "Unable to update ", error: error.message });
  }
}

const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await prisma.feedback.findUnique({
      where: { id: BigInt(id) }
    });

    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    const callerId = req.user?.id;
    const isOwner = callerId && String(feedback.user_id) === String(callerId);
    const isAdmin = req.user?.role === 'ADMIN';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Not authorized to delete this feedback' });

    await prisma.feedback.delete({ where: { id: BigInt(id) } });

    // Fire-and-forget: audit log + cache invalidation
    createAuditLog({
      table_name: "Feedback",
      record_id: feedback.id,
      action: "DELETE",
      previous_data: feedback,
      user_id: callerId,
      role: req.user?.role,
      ip_address: req.ip,
      device: req.headers['user-agent']
    });
    invalidateFeedbackCache(callerId).catch(console.error);

    return res.status(200).json({ success: true, message: "Feedback deleted successfully" });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete feedback",
      error: error.message
    });
  }
}

export { getFeedback, createFeedback, getAllFeedbacks, updateFeedback, deleteFeedback }