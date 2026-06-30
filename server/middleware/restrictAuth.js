import jwt from 'jsonwebtoken';

// block login/signup when a valid auth cookie is already present
export const restrictAuth = (req, res, next) => {
  const token = req.signedCookies?.[process.env.COOKIE_KEY] || req.cookies?.[process.env.COOKIE_KEY];
  if (!token) return next();
  try {
    const secret = process.env.JWT_SECRET || 'any_harcoded_secretkey';
    req.user = jwt.verify(token, secret);
    return res.status(400).json({ message: 'You are already logged in' });
  } catch (err) {
    return next();
  }
}