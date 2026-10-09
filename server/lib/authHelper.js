import jwt from 'jsonwebtoken'
const generateToken = (data)=>{
    const secret_key = process.env.JWT_SECRET || "any_harcoded_secretkey";
    return jwt.sign(data, secret_key); // required to add token expiration time
}

const isStrongPassword  = (password)=>{
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
    return strongPasswordRegex.test(password);
}

export { generateToken, isStrongPassword};
