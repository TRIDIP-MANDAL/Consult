import jwt from 'jsonwebtoken'

export const protect = (req, res, next) => {
    const token = req.signedCookies[process.env.COOKIE_KEY]
    console.log("signed cookies ",req.signedCookies, "normal cookie ", req.cookies)
    console.log("Inside ProtectRoute token ", token)
    if (!token) return res.status(401).json({ message: "No token provided, Please Login" });

    try {
        const secret = process.env.JWT_SECRET || 'any_harcoded_secretkey';
        req.user = jwt.verify(token, secret);
         console.log("user in protect route ",req.user)
        return next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

export const userRoute = (req, res, next) => {
    if (req.user) return next();
    return res.status(401).json({ message: "Please login first" });
}

export const mentorRoute = (req, res, next) => {
    if (req.user && req.user.role === 'MENTOR') return next();
    return res.status(403).json({ message: "Access is denied for that resource" });
}

export const adminRoute = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') return next();
    return res.status(403).json({ message: "Access is denied for that resource" });
}