import express from 'express'
import { sendOtp, verifyOtp } from '../controller/mobOtp.controller.js'
export const mobOtpRouter = express.Router();
mobOtpRouter.post('/send', sendOtp);
mobOtpRouter.post('/verify', verifyOtp);  
