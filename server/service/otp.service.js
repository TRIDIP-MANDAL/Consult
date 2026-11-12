import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import redis from '../lib/redis.js';

const twilioClient = twilio(process.env.TWILIO_ACNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ─── Email OTP ────────────────────────────────────────────────────────────────

const sendEmailOtp = async (email) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.OUR_MAIL,
      pass: process.env.OUR_MAIL_PASSWD
    }
  });

  await transporter.sendMail({
    from: `"Vriddhi" <${process.env.OUR_MAIL}>`,
    to: email,
    subject: 'Vriddhi - Your OTP For Email Verification',
    text: `Your OTP is ${otp}. It is valid for 10 minutes. Do not share it with anyone.`
  });

  const key = `otp:${email}`;
  await redis.del(key);
  await redis.setex(key, 600, hashedOtp);
};

const verifyEmailOtp = async (email, otp, userAgent) => {
  const key = `otp:${email}`;
  const cachedOtp = await redis.get(key);
  console.log('Cached otp ', cachedOtp);
  if (!cachedOtp) throw new Error('OTP_EXPIRED');

  const isMatch = await bcrypt.compare(otp, cachedOtp);
  if (!isMatch) throw new Error('OTP_INVALID');

  await redis.setex(`otp:${email}:verified`, 600, true);

  // Issue a one-time reset_token bound to this device (User-Agent)
  const resetToken = crypto.randomUUID();
  await redis.setex(
    `reset-token:${resetToken}`,
    600,
    JSON.stringify({ identifier: email, userAgent: userAgent || '' })
  );

  return resetToken;
};

// ─── Mobile OTP ───────────────────────────────────────────────────────────────

const sendMobileOtp = async (phone) => {
  const otp = crypto.randomInt(100000, 1000000).toString();

  const sms = await twilioClient.messages.create({
    body: `Your otp for verification is ${otp}. It is valid for 10 minutes. Do not share it with anyone.`,
    from: process.env.TWILIO_SENDER_PH_NO,
    to: phone
  });

  const hashedOtp = await bcrypt.hash(otp, 10);
  const key = `otp:${phone}`;
  await redis.del(key);
  await redis.setex(key, 600, hashedOtp);

  if (!sms.sid) throw new Error('SMS_SEND_FAILED');
};

const verifyMobileOtp = async (phone, otp, userAgent) => {
  const key = `otp:${phone}`;
  const hashedOtp = await redis.get(key);
  if (!hashedOtp) throw new Error('OTP_EXPIRED');

  const isMatch = await bcrypt.compare(otp, hashedOtp);
  if (!isMatch) throw new Error('OTP_INVALID');

  await redis.del(key);
  await redis.setex(`otp:${phone}:verified`, 600, true);

  // Issue a one-time reset_token bound to this device (User-Agent)
  const resetToken = crypto.randomUUID();
  await redis.setex(
    `reset-token:${resetToken}`,
    600,
    JSON.stringify({ identifier: phone, userAgent: userAgent || '' })
  );

  return resetToken;
};

export { sendEmailOtp, verifyEmailOtp, sendMobileOtp, verifyMobileOtp };
