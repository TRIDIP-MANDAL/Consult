import redis from "../lib/redis.js";

export const isVerified = async (req, res, next)=>{
   const {email, phone} = req.body.user || req.body;
   if(!email || !phone){
      return res.status(400).json({ message: "Email or phone is empty", success: false });
    }
    if (await redis.get(`otp:${email}:verified`) && await redis.get(`otp:${phone}:verified`)) {
       return next();
    }
    else {
       return res.status(400).json({ message: "Email or phone not verified", success: false });
    }
}