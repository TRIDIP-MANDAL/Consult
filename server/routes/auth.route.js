import express from 'express';
import { signup, login, logout, resetPassword, me } from '../controller/auth.controller.js';
import { protect } from '../middleware/protectRoute.js'
import { restrictAuth } from '../middleware/restrictAuth.js'
import { isVerified, isVerifiedForReset } from '../middleware/otpVerified.js'
export const authentication = express.Router();

authentication.post('/signup', restrictAuth, isVerified, signup);
// authentication.post('/signup', signup); //for putting dymmy data
authentication.post('/login', restrictAuth, login);
authentication.get('/logout', protect, logout); //done
authentication.patch('/reset-passwd', restrictAuth, isVerifiedForReset, resetPassword);
authentication.get('/me', protect, me); // returns slim user shape from JWT cookie — used by frontend on App load
