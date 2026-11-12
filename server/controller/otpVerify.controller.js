import { sendEmailOtp, verifyEmailOtp } from '../service/otp.service.js';

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('email ', email);
    await sendEmailOtp(email);
    return res.status(200).json({ message: 'OTP sent to your mail', success: true });
  } catch (error) {
    console.log('Error during sending otp, please try again later ', error);
    return res.status(400).json({ message: 'unable to send otp ', success: false, error: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const userAgent = req.headers['user-agent'] || '';
    const resetToken = await verifyEmailOtp(email, otp, userAgent);
    return res.status(200).json({ message: 'Email verified successfully', success: true, resetToken });
  } catch (error) {
    console.log('Error during verifying OTP:', error);
    if (error.message === 'OTP_EXPIRED') {
      return res.status(400).json({ message: 'OTP expired or not found.', success: false });
    }
    if (error.message === 'OTP_INVALID') {
      return res.status(400).json({ message: 'Incorrect Otp', success: false });
    }
    return res.status(500).json({ message: 'Unable to verify OTP', success: false, error: error.message });
  }
};