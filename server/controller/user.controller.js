import { AppError } from '../exception/AppError.js';
import * as userService from '../service/user.service.js';

const handleError = (res, error, fallbackMsg) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ success: false, message: error.message });
  }
  return res.status(500).json({ success: false, message: fallbackMsg, error: error.message });
};

const loadProfile = async (req, res) => {
  try {
    console.log('request params ', req.params);
    const data = await userService.loadProfile(req.params.id);
    console.log(data);
    return res.status(200).json({ success: true, message: 'Profile fetched successfully', data });
  } catch (error) {
    console.error('Error in loadProfile:', error.message);
    return handleError(res, error, 'Please try again later');
  }
};

const updateProfile = async (req, res) => {
  try {
    console.log('request params ', req.params);
    console.log('request body ', req.body);
    const ip = req.ip || req.headers['x-forwarded-for'] || 'Unknown';
    const device = req.headers['user-agent'] || 'Unknown';
    const data = await userService.updateProfile({
      id: req.params.id,
      userData: req.body.user,
      mentorData: req.body?.mentor || null,
      audit: req.body.audit,
      ip,
      device,
    });
    return res.status(200).json({ success: true, message: 'Profile updated successfully', data });
  } catch (error) {
    return handleError(res, error, 'Failed to update, please try again later');
  }
};

const changePassword = async (req, res) => { // DOUBT, is it even used any where
  try {
    await userService.changePassword(req.params.id, req.body.password);
    return res.status(200).json({ success: true, message: 'User password updated successfully ' });
  } catch (error) {
    return handleError(res, error, 'Unable to change user password');
  }
};

const deActivateProfile = async (req, res) => {
  try {
    // just deactivate the account, verify both email and no before deactivating the account
    const deactivatedUser = await userService.deActivateProfile(req.params.id);
    return res.clearCookie(process.env.COOKIE_KEY).status(200).json({
      success: !deactivatedUser.isactive,
      message: deactivatedUser.isactive ? 'Unable to deactivate the profile' : 'Profile is deleted successfully '
    });
  } catch (error) {
    return handleError(res, error, 'Unknown error occurred, try again later');
  }
};

const loadMentors = async (req, res) => {
  try {
    const mentors = await userService.loadMentors(req.query);
    return res.status(200).json({ success: true, message: 'Mentors loaded successfully', data: mentors });
  } catch (error) {
    return handleError(res, error, 'Unable to load mentors');
  }
};

const searchMentorSuggestions = async (req, res) => {
  try {
    const data = await userService.searchMentorSuggestions(req.query.q);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    console.error('searchMentorSuggestions error:', error);
    return res.status(500).json({ success: false, message: 'Search failed' });
  }
};

const loadMentorProfile = async (req, res) => {
  try {
    const data = await userService.loadMentorProfile(req.params.id);
    return res.status(200).json({ success: true, message: 'Mentor profile fetched successfully', data });
  } catch (error) {
    console.error('Error in loadMentorProfile:', error.message);
    return handleError(res, error, 'Unable to load mentor profile');
  }
};

export {
  loadProfile, updateProfile, changePassword,
  deActivateProfile, loadMentors, loadMentorProfile, searchMentorSuggestions
};
