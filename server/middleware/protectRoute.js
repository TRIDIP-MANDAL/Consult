import jwt from 'jsonwebtoken'

const protect = (req, res, next) => {
    const token = req.signedCookies[process.env.COOKIE_KEY]
    console.log("Inside ProtectRoute token ", token)
    if (!token) return res.status(401).json({success:false, message: "No token provided, Please Login" });

    try {
        const secret = process.env.JWT_SECRET || 'any_harcoded_secretkey';
        req.user = jwt.verify(token, secret);
        console.log("user in protect route ", req.user)
        return next();
    } catch (err) {
        return res.status(401).json({success:false, message: "Invalid or expired token" });
    }
}

const optionalUser = (req, res, next) => {
    const token = req.signedCookies[process.env.COOKIE_KEY];
    if (token) {
        try {
            const secret = process.env.JWT_SECRET || 'any_harcoded_secretkey';
            req.user = jwt.verify(token, secret);
        } catch (err) {
            console.log("OptionalUser middleware: Invalid token ignored");
        }
    }
    return next();
}

const userRoute = (req, res, next) => {
    if (req.user) return next();
    return res.status(401).json({success:false, message: "Please login first" });
}

const mentorRoute = (req, res, next) => {
    if (req.user && req.user.role === 'MENTOR') return next();
    return res.status(403).json({success:false, message: "Access is denied for that resource" });
}

const adminRoute = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') return next();
    return res.status(403).json({success:false, message: "Access is denied for that resource" });
}

export { protect, optionalUser, userRoute, mentorRoute, adminRoute };