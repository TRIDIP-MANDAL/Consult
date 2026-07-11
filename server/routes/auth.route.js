import express from 'express';
import { signup, login, loadProfile, updateProfile, logout, changePassword, deActivateProfile, resetPassword } from '../controller/auth.controller.js';
import { userRoute, protect } from '../middleware/protectRoute.js'
import { restrictAuth } from '../middleware/restrictAuth.js'
import { isVerified } from '../middleware/otpVerified.js'
export const authentication = express.Router();

authentication.post('/signup', restrictAuth, isVerified, signup);
authentication.post('/login', restrictAuth, login);
authentication.get('/profile/:id', protect, userRoute, loadProfile);
authentication.patch('/editprofile/:id', protect, userRoute, updateProfile); //done
authentication.get('/logout', protect, userRoute, logout); //done
authentication.patch('/changepasswd/:id', protect, userRoute, changePassword);//done
authentication.delete('/deleteprofile/:id', protect, userRoute, deActivateProfile); //done 
authentication.patch('/reset-passwd', restrictAuth,  isVerified, resetPassword);

// might need to add averify profile option to verify mentor profile via document