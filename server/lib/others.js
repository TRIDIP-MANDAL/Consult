import nodemailer from "nodemailer";
import twilio from "twilio";
import prisma from "../model/db.js";

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
        console.log("mail sent ", text)
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
        console.log("sms sent ", body)
        
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

const createAuditLog = async ({ 
    table_name,
    record_id,
    action, // 'CREATE', 'UPDATE', 'DELETE'
    previous_data = null,
    updated_data = null,
    user_id = null,
    role = null,
    ip_address = null,
    device = null
}) => {
    try {
        // If we are in a transaction, we use tx. If not, we use prisma.
        await prisma.auditLog.create({
            data: {
                table_name,
                record_id: BigInt(record_id),
                action,
                previous_data,
                updated_data,
                user_id: user_id ? BigInt(user_id) : null,
                role,
                ip_address,
                device
            }
        });
    } catch (err) {
        console.error("Error while creating audit log", err.message);
    }
}

export { purifyObject, sendMail, sendSMS, createAuditLog};