import express from 'express';
import { signup, login, loadProfile, updateProfile, logout, changePassword, deActivateProfile } from '../controller/auth.controller.js';
import { userRoute, protect } from '../middleware/protectRoute.js'
import { restrictAuth } from '../middleware/restrictAuth.js'
export const authentication = express.Router();

authentication.post('/signup', restrictAuth, signup);
authentication.post('/login', restrictAuth, login);
authentication.get('/profile/:id', protect, userRoute, loadProfile);// done
authentication.patch('/editprofile/:id', protect, userRoute, updateProfile); //done
authentication.get('/logout', protect, userRoute, logout); //done
authentication.patch('/changepasswd/:id', protect, userRoute, changePassword);//done
authentication.delete('/deleteprofile/:id', protect, userRoute, deActivateProfile); //done 

// might need to add averify profile option to verify mentor profile via document