import { sendMobileOtp, verifyMobileOtp } from '../service/otp.service.js';

const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    console.log('Request body mob otp', req.body);
    await sendMobileOtp(phone);
    return res.status(200).json({ success: true, message: 'Otp sent successfully' });
  } catch (err) {
    console.log('IN case of mobile otp error ', err.message);
    if (err.message === 'SMS_SEND_FAILED') {
      return res.status(400).json({ success: false, message: 'Unable to send otp' });
    }
    return res.status(500).json({ success: false, message: 'Unable to verify mobile no', error: err.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const userAgent = req.headers['user-agent'] || '';
    const resetToken = await verifyMobileOtp(phone, otp, userAgent);
    return res.status(200).json({ success: true, message: 'Otp verified successfully', resetToken });
  } catch (error) {
    console.log('IN case of mobile otp verify error ', error.message);
    let message = 'Unable to verify mobile no';
    let status = 500;
    switch (error.message) {
      case 'OTP_EXPIRED':
        message = 'Otp expired or not found';
        status = 400;
        break;
      case 'OTP_INVALID':
        message = 'Invalid Otp';
        status = 400;
        break;
    }
    return res.status(status).json({ success: false, message: message, error: error.message || null });
  }
};

export { sendOtp, verifyOtp };