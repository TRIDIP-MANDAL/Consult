import redis from '../lib/redis.js';
import { createAuditLog } from '../lib/others.js';
import {
  findFeedbackByUserId,
  createFeedback as repoCreateFeedback,
  getAllFeedbacksRaw,
  findFeedbackById,
  updateFeedback as repoUpdateFeedback,
  deleteFeedback as repoDeleteFeedback,
} from '../repository/feedback.repository.js';
import { ForbiddenError, NotFoundError } from '../exception/AppError.js';

const invalidateFeedbackCache = async (userId) => {
  const patterns = [
    `feedbacks:p*:l*:o*:u${userId}`,
    `feedbacks:p*:l*:o*:uguest`
  ];
  for (const pattern of patterns) {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  }
};


const getFeedback = async (userId) => {
  return findFeedbackByUserId(userId);
};


const createFeedback = async (userId, content, rating, role, ip, device) => {
  const feedback = await repoCreateFeedback({ userId, content, rating });

  createAuditLog({
    table_name: 'Feedback',
    record_id: feedback.id,
    action: 'CREATE',
    updated_data: { content, rating },
    user_id: userId,
    role,
    ip_address: ip,
    device
  });
  invalidateFeedbackCache(userId).catch(console.error);

  return feedback;
};


const getAllFeedbacks = async ({ page, limit, order, loggedInUserId }) => {
  const orderDir = order === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;
  const resolvedUserId = loggedInUserId ? BigInt(loggedInUserId) : null;

  const cacheKey = `feedbacks:p${page}:l${limit}:o${orderDir}:u${resolvedUserId ?? 'guest'}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const { rows, total } = await getAllFeedbacksRaw({
    loggedInUserId: resolvedUserId,
    limit,
    offset,
    order: orderDir
  });

  const hasMore = page * limit < total;

  let myFeedback = null;
  let feedbacks = null;

  if (page === 1 && resolvedUserId) {
    const myIdx = rows.findIndex((f) => f.user_id === resolvedUserId);
    if (myIdx !== -1) myFeedback = rows[myIdx];
    feedbacks = rows.filter((_, i) => i !== myIdx);
  } else {
    feedbacks = rows;
  }

  const payload = { success: true, page, limit, total, hasMore, myFeedback, feedbacks };

  await redis.set(cacheKey, JSON.stringify(payload), 'EX', 60);
  return payload;
};


const updateFeedback = async ({ id, updates, callerId, callerRole, ip, device }) => {
  const existing = await findFeedbackById(id);
  if (!existing) throw new NotFoundError('Feedback not found');

  const isOwner = callerId && String(existing.user_id) === String(callerId);
  const isAdmin = callerRole === 'ADMIN';
  if (!isOwner && !isAdmin) throw new ForbiddenError('Not authorized to update this feedback');

  const obj = {};
  ['content', 'rating'].forEach((key) => {
    const value = updates[key];
    if (value !== undefined) {
      obj[key] = key === 'rating' ? Number(value) : value;
    }
  });

  const feedback = await repoUpdateFeedback(id, obj);

  const feedbackData = {
    ...feedback,
    id: feedback.id.toString(),
    user_id: feedback.user_id?.toString() || null
  };

  createAuditLog({
    table_name: 'Feedback',
    record_id: feedback.id,
    action: 'UPDATE',
    previous_data: existing,
    updated_data: obj,
    user_id: callerId,
    role: callerRole,
    ip_address: ip,
    device
  });
  invalidateFeedbackCache(callerId).catch(console.error);

  return feedbackData;
};


const deleteFeedback = async ({ id, callerId, callerRole, ip, device }) => {
  const feedback = await findFeedbackById(id);
  if (!feedback) throw new NotFoundError('Feedback not found');

  const isOwner = callerId && String(feedback.user_id) === String(callerId);
  const isAdmin = callerRole === 'ADMIN';
  if (!isOwner && !isAdmin) throw new ForbiddenError('Not authorized to delete this feedback');

  await repoDeleteFeedback(id);

  createAuditLog({
    table_name: 'Feedback',
    record_id: feedback.id,
    action: 'DELETE',
    previous_data: feedback,
    user_id: callerId,
    role: callerRole,
    ip_address: ip,
    device
  });
  invalidateFeedbackCache(callerId).catch(console.error);
};

export { getFeedback, createFeedback, getAllFeedbacks, updateFeedback, deleteFeedback };
