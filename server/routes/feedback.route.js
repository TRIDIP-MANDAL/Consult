import express from 'express';
export const feedback = express.Router();
import { getFeedback, getAllFeedbacks, createFeedback, updateFeedback, deleteFeedback } from '../controller/feedback.controller.js';
import { userRoute, protect } from '../middleware/protectRoute.js'
feedback.get('/fetch/:id', getFeedback);
feedback.get('/fetchall', getAllFeedbacks);
feedback.post('/create', protect, userRoute, createFeedback); //only for loggedin
feedback.patch('/update/:id', protect, userRoute, updateFeedback); //only for loged in
feedback.delete('/delete/:id', protect, userRoute, deleteFeedback); //only for logged in