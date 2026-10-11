import { AppError, NotFoundError } from '../exception/AppError.js';
import * as feedbackService from '../service/feedback.service.js';
const handleError = (res, error, fallbackMsg) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ success: false, message: error.message });
  }
  return res.status(500).json({ success: false, message: fallbackMsg, error: error.message });
};

const getFeedback = async (req, res) => {
  try {
    const { id } = req.user;
    console.log('userId', id);
    const feedback = await feedbackService.getFeedback(id);
    console.log(feedback);
    if (!feedback) throw new NotFoundError('Feedback not found');
    return res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    return handleError(res, error, 'Unable to find any feedback for now, please try again later!');
  }
};

const createFeedback = async (req, res) => {
  try {
    console.log('create fedback ', req.params);
    const { content, rating } = req.body;
    const authUserId = req.user.id;
    await feedbackService.createFeedback(
      authUserId,
      content,
      rating,
      req.user.role,
      req.ip,
      req.headers['user-agent'],
    );
    return res.status(201).json({ success: true, message: 'Your feedback is added, thank you for your feedback' });
  } catch (error) {
    return handleError(res, error, 'Unable to create feedback');
  }
};

const getAllFeedbacks = async (req, res) => {
  try {
    const order = req.query.order === 'asc' ? 'asc' : 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 4;
    const loggedInUserId = req.user?.id ?? null;

    const payload = await feedbackService.getAllFeedbacks({ page, limit, order, loggedInUserId });
    return res.status(200).json(payload);
  } catch (error) {
    return handleError(res, error, 'Internal server error');
  }
};

const updateFeedback = async (req, res) => {
  try {
    const feedbackData = await feedbackService.updateFeedback({
      id: req.params.id,
      updates: req.body,
      callerId: req.user?.id,
      callerRole: req.user?.role,
      ip: req.ip,
      device: req.headers['user-agent'],
    });
    return res.status(200).json({ success: true, message: 'Updated successfully !', data: feedbackData });
  } catch (error) {
    return handleError(res, error, 'Unable to update');
  }
};

const deleteFeedback = async (req, res) => {
  try {
    await feedbackService.deleteFeedback({
      id: req.params.id,
      callerId: req.user?.id,
      callerRole: req.user?.role,
      ip: req.ip,
      device: req.headers['user-agent'],
    });
    return res.status(200).json({ success: true, message: 'Feedback deleted successfully' });
  } catch (error) {
    return handleError(res, error, 'Unable to delete feedback');
  }
};

export { getFeedback, createFeedback, getAllFeedbacks, updateFeedback, deleteFeedback };