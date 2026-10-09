import { AppError } from '../exception/AppError.js';
import * as authService from '../service/auth.service.js';
import * as userService from '../service/user.service.js';

const handleError = (res, error, fallbackMsg) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ success: false, message: error.message });
  }
  return res.status(500).json({ success: false, message: fallbackMsg, error: error.message });
};

const signup = async (req, res) => {
  try {
    console.log('Reached data ', req.body);
    await authService.signup({
      user: req.body.user,
      mentor: req.body.mentor || null,
    });
    return res.status(201).json({ success: true, message: 'Sign up successful!' });
  } catch (error) {
    return handleError(res, error, 'Some Error occured during signup. Please try again later!');
  }
};

const login = async (req, res) => {
  try {
    const { token, data } = await authService.login({
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      role: req.body.role,
    });
    return res.status(200).cookie(process.env.COOKIE_KEY, token, {
      signed: true,
      httpOnly: true,
      // secure: true,       // Ensures cookie is only sent over HTTPS
      // maxAge: 24 * 60 * 60 * 1000, removed to create a Session Cookie (expires on window close)
      sameSite: 'strict'  // Protects against CSRF attacks
    }).json({ success: true, message: 'Login Successful', data });
  } catch (error) {
    return handleError(res, error, 'Login Failed');
  }
};

const logout = (req, res) => {
  try {
    return res.status(200).clearCookie(process.env.COOKIE_KEY).json({ success: true, message: 'Logged out ' });
  } catch (error) {
    return res.status(500).json({ success: false, message: ' Unable to logout, try again later' });
  }
};

const resetPassword = async (req, res) => {
  try {
    await authService.resetPassword({
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
    });
    return res.status(200).json({ success: true, message: 'Password reset successfully ' });
  } catch (error) {
    console.error('Error in resetPassword: ', error);
    return handleError(res, error, 'Unable to reset password');
  }
};

const me = async (req, res) => {
  try {
    const data = await userService.loadProfile(req.user.id);
    return res.status(200).json({
      success: true,
      data: {
        isloggedin: true,
        id: String(data.id),
        name: data.full_name,
        role: data.role,
        image: data.image || null,
        profession_category: data.profession_category || null,
      },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
};

export {
  signup, login, logout, resetPassword, me
};