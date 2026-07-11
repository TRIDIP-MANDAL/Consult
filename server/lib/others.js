import nodemailer from "nodemailer";
import twilio from "twilio";

// during update if mail is changed , sms will be sent to mobile
// if mobile is changed sms will be sent to email, a logic need to be impemented for both

const accountSid = process.env.TWILIO_ACNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

const sendMail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.OUR_MAIL,
                pass: process.env.OUR_MAIL_PASSWD
            }
        });

        const info = await transporter.sendMail({
            from: `"Vriddhi" <${process.env.OUR_MAIL}>`,
            to,
            subject,
            text
        });
        return { success: true, info };
    } catch (error) {
        console.error("Error sending mail:", error);
        return { success: false, error: error.message };
    }
};

const sendSMS = async (to, body) => {
    try {
        const sms = await twilioClient.messages.create({
            body,
            from: process.env.TWILIO_SENDER_PH_NO,
            to
        });
        
        if (!sms.sid) {
            return { success: false, message: "Unable to send SMS" };
        }
        return { success: true, sid: sms.sid };
    } catch (error) {
        console.error("Error sending SMS:", error);
        return { success: false, error: error.message };
    }
};

const purifyObject = (obj) => {
   Object.keys(obj).forEach((key) => {
      if (obj[key] === "") delete obj[key];
   })
}

const cleanObject = (obj) => {

}

export { purifyObject, cleanObject, sendMail, sendSMS };