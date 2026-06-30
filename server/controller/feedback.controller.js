import prisma from "../model/db.js";

export const getFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);

    const feedback = await prisma.feedback.findFirst({
      where: {
        id: BigInt(id)
      }
    });
    console.log(feedback);
    if (!feedback) return res.status(404).json({ message: "Feedback not found!" });

    const feedbackData = {
      ...feedback,
      id: feedback.id.toString(),
      user_id: feedback.user_id?.toString() || null
    };
    return res.status(200).json({ data: feedbackData });
  }
  catch (error) {
    return res.status(500).json({ message: "Unable to find any feedback for now, please try again later!", error: error.message });
  }
}

export const createFeedback = async (req, res) => {
  try {
    console.log("create fedback ", req.params)
    const { image, content } = req.body;
    // Prefer authenticated user id; fall back to null if not present
    const authUserId = req.user?.id;
    const feedback = await prisma.feedback.create({
      data: {
        user_id: authUserId ? BigInt(authUserId) : null,
        image: image,
        content: content
      }
    });
    console.log(feedback)
    return res.status(201).json({ message: "Your feedback is added, thank you for your feedback" });
  }
  catch (error) {
    return res
      .status(500)
      .json({ message: "Unable to create feedback", error: error.message });
  }
}

export const getAllFeedbacks = async (req, res) => { //here ,each time in front end I have to store previous res data and render them, 
  try {
    // anothere thing need to be added here like if user is logged in, he or she can see his feedback also
    const order = req.query.order;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 4;

    const filter = {
      skip: (page - 1) * limit, // offset
      take: limit
    };

    if (order === 'asc' || order === 'desc') {
      filter.orderBy = {
        created_at: order
      };
    }

    // If requesting only the logged-in user's feedbacks
    let whereClause = undefined;
    if (req.query.mine && req.user?.id) {
      whereClause = { user_id: BigInt(req.user.id) };
      filter.where = whereClause;
    }

    // Fetch page results and total count in parallel for load-more UX
    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany(filter),
      prisma.feedback.count(Object.keys(whereClause || {}).length ? { where: whereClause } : {})
    ]);

    const feedbackData = feedbacks.map((v) => {
      let obj={
        ...v,
        id : v.id?.toString(),
        user_id : v.user_id?.toString() || null          
      }
      return obj;
    })
    const hasMore = page * limit < total;

    return res.status(200).json({
      message: "Fetched successfully",
      page,
      limit,
      total,
      hasMore,
      feedbackData
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

export const updateFeedback = async (req, res) => {
  try {
    const obj = {};
    ["content", "image", "video"].forEach((key) => {
      let value = req.body[key];
      if (value !== undefined)
        obj[key] = value;
    })
    // Ensure the feedback exists and caller is owner (or admin)
    const existing = await prisma.feedback.findUnique({ where: { id: BigInt(req.params.id) } });
    if (!existing) return res.status(404).json({ message: 'Feedback not found' });

    const callerId = req.user?.id;
    const isOwner = callerId && String(existing.user_id) === String(callerId);
    const isAdmin = req.user?.role === 'ADMIN';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not authorized to update this feedback' });

    const feedback = await prisma.feedback.update({ where: { id: BigInt(req.params.id) }, data: obj });

    // Convert BigInt fields to strings for JSON serialization
    const feedbackData = {
      ...feedback,
      id: feedback.id.toString(),
      user_id: feedback.user_id?.toString() || null
    };

    return res.status(200).json({ message: "Updated successfully !", data: feedbackData });
  }
  catch (error) {
    return res.status(500).json({ message: "Unable to update ", error: error.message });
  }
}

export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await prisma.feedback.findUnique({
      where: { id: BigInt(id) }
    });

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const callerId = req.user?.id;
    const isOwner = callerId && String(feedback.user_id) === String(callerId);
    const isAdmin = req.user?.role === 'ADMIN';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not authorized to delete this feedback' });

    await prisma.feedback.delete({ where: { id: BigInt(id) } });

    return res.status(200).json({ message: "Feedback deleted successfully" });

  } catch (error) {
    return res.status(500).json({
      message: "Unable to delete feedback",
      error: error.message
    });
  }
}