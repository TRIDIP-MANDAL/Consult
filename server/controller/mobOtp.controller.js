import bcrypt from 'bcryptjs'
import redis from '../lib/redis.js'
import crypto from 'crypto'
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

const sendOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        console.log("Request body mob otp", req.body)
        const otp = crypto.randomInt(100000, 1000000).toString();
        const sms = await client.messages.create({
            body: `Your otp for verification is ${otp}. It is valid for 10 minutes. Do not share it with anyone.`,
            from: process.env.TWILIO_SENDER_PH_NO,
            to: phone
        })
        const hashedOtp = await bcrypt.hash(otp, 10);
        const key = `otp:${phone}`
        await redis.del(key)
        await redis.setex(key, 600, hashedOtp)
        if(!sms.sid){
            console.log("Something went wrong ")
            return res.status(400).json({ success: false, message: "Unable to send otp" });
        }
        console.log("IN case of mobile otp ", sms.sid);
        return res.status(200).json({ success: true, message: "Otp sent successfully" });
    }
    catch (err) {
        console.log("IN case of mobile otp error ", err.message);
        return res.status(500).json({ success: false, message: "Unable to verify mobile no", error: err.message });
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const key = `otp:${phone}`
        const hashedOtp = await redis.get(key);
        if (!hashedOtp) {
            return res.status(400).json({ success: false, message: "Otp expired or not found" });
        }
        const isMatch = await bcrypt.compare(otp, hashedOtp);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid Otp" });
        }
        await redis.del(key);
        await redis.setex(`otp:${phone}:verified`, 600, true)
        return res.status(200).json({ success: true, message: "Otp verified successfully" });
    } catch (error) {
        console.log("IN case of mobile otp verify error ", error.message);
        return res.status(500).json({ success: false, message: "Unable to verify mobile no", error: error.message });
    }
}
export { sendOtp, verifyOtp };
// client.messages
//     .create({
//         from: process.env.TWILIO_SENDER_PH_NO,
//         to: '+18777804236'
//     })
//     .then(message => console.log(message.sid));

// response received after sending sms

// 201 - CREATED - The request was successful. We created a new resource and the response body contains the representation.
// {
//   "account_sid": "",
//   "api_version": "2010-04-01",
//   "body": "Sent from your Twilio trial account - jhgi",
//   "date_created": "Wed, 08 Jul 2026 18:37:10 +0000",
//   "date_sent": null,
//   "date_updated": "Wed, 08 Jul 2026 18:37:10 +0000",
//   "direction": "outbound-api",
//   "error_code": null,
//   "error_message": null,
//   "from": "+19787055434",
//   "messaging_service_sid": null,
//   "num_media": "0",
//   "num_segments": "1",
//   "price": null,
//   "price_unit": "USD",
//   "sid": "",
//   "status": "queued",
//   "subresource_uris": {
//     "media": ""
//   },
//   "to": "",
//   "uri": ""
// }