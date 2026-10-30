import express from 'express';
import { loadProfile, updateProfile, changePassword, deActivateProfile, loadMentors, loadMentorProfile, searchMentorSuggestions } from '../controller/user.controller.js';
import { userRoute, protect, optionalUser } from '../middleware/protectRoute.js'
export const user = express.Router();

user.get('/profile/:id', protect, userRoute, loadProfile);
user.patch('/editprofile/:id', protect, userRoute, updateProfile); // later implement here the option for updating email , phone no etc.
user.patch('/changepasswd/:id', protect, userRoute, changePassword);//done
user.delete('/deleteprofile/:id', protect, userRoute, deActivateProfile); //done
user.get('/our-mentors', optionalUser, loadMentors);
user.get('/our-mentors/suggestions',optionalUser, searchMentorSuggestions);
user.get('/mentor/:id',optionalUser, loadMentorProfile);
// might need to add averify profile option to verify mentor profile via document
