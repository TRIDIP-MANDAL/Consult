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

// ─── isVerifiedForReset ───────────────────────────────────────────────────────
// Used exclusively on PATCH /reset-passwd.
// Validates the one-time reset_token issued during OTP verification.
// Checks: token exists in Redis, User-Agent matches, identifier (email/phone) matches.
// Deletes the token immediately on success — single use only.

export const isVerifiedForReset = async (req, res, next) => {
  const { resetToken, email, phone } = req.body;

  if (!resetToken) {
    return res.status(400).json({ success: false, message: 'Reset token is required' });
  }

  const raw = await redis.get(`reset-token:${resetToken}`);
  if (!raw) {
    return res.status(400).json({ success: false, message: 'Reset session expired or invalid. Please verify OTP again.' });
  }

  let stored;
  try {
    stored = JSON.parse(raw);
  } catch {
    return res.status(500).json({ success: false, message: 'Invalid reset session data' });
  }

  // User-Agent must match the device that verified the OTP
  const currentUA = req.headers['user-agent'] || '';
  if (stored.userAgent && stored.userAgent !== currentUA) {
    return res.status(403).json({ success: false, message: 'Request must come from the same device that verified the OTP' });
  }

  // The token's identifier must match either the email or phone in the request
  if (stored.identifier !== email && stored.identifier !== phone) {
    return res.status(403).json({ success: false, message: 'Reset token does not match the provided credentials' });
  }

  // One-time use — delete immediately before proceeding
  await redis.del(`reset-token:${resetToken}`);

  next();
};