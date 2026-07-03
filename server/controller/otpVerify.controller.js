import crypto from 'crypto'
import nodemailer from 'nodemailer'
import bcrypt from 'bcryptjs'
import redis from '../lib/redis.js'

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        console.log("email ", email)
        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.OUR_MAIL,
                pass: process.env.OUR_MAIL_PASSWD
            }
        })

        await transporter.sendMail({
            from: `"Vriddhi" <${process.env.OUR_MAIL}>`,
            to: email,
            subject: "Vriddhi - Your OTP For Email Verification",
            text: `Your OTP is ${otp}. It is valid for 10 minutes. Do not share it with anyone.`
        })

        const key = `otp:${email}`
        await redis.del(key)
        await redis.setex(key, 600, hashedOtp)
        return res.status(200).json({ message: "OTP sent to your mail" , success: true});
    }
    catch (error) {
        console.log("Error during sending otp, please try again later ", error);
        // here it is required to configure and throw the proper error
        return res.status(400).json({ message: "unable to send otp ", success: false, error: error.message });
    }
}

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const key = `otp:${email}`
        const cachedOtp = await redis.get(key);
        console.log("Cached otp ", cachedOtp)
        if (!cachedOtp) {
            return res.status(400).json({ message: "OTP expired or not found." , success: false})
        }

        const isMatch = await bcrypt.compare(otp, cachedOtp);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect Otp", success: false })
        }
        
        await redis.setex(`otp:${email}:verified`, 600, true)
        // await redis.del(key); // delete OTP after successful verification
        // dont need to manually delete it, as after 10 minutes, it will be automatically deleted
        return res.status(200).json({ message: "Email verified successfully", success: true});
    }
    catch (error) {
        console.log("Error during verifying OTP:", error);
        return res.status(500).json({ message: "Unable to verify OTP", success: false, error: error.message });
    }
}