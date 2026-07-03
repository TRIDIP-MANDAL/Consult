import express from "express";
import {sendOtp, verifyOtp} from "../controller/otpVerify.controller.js"
export const otpverification = express.Router();
// here need to put the rate limiting to avoid infinite request 
otpverification.post("/sendOtp", sendOtp)
otpverification.post("/verifyOtp", verifyOtp)

// otpverification.post("/resendopt", (req,res) => {
    
// })