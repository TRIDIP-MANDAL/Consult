import redis from "../lib/redis.js";

export const isVerified = async (req, res, next)=>{
    let { email } = req.body;
    if(!email){
       email = req.body?.user?.email;
    }
    if (await redis.get(`otp:${email}:verified`)) {
       return next();
    }
    else {
       return res.status(400).json({ message: "Email not verified", success: false });
    }
}