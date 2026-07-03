import redis from "../lib/redis.js";

export const isVerified = async (req, res, next)=>{
    const { email } = req.body;
    if (await redis.get(`otp:${email}:verified`)) {
       return next();
    }
    else {
       return res.status(400).json({ message: "Email not verified", success: false });
    }
}