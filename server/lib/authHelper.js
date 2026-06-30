import jwt from 'jsonwebtoken'
export const generateToken = (data)=>{
    const secret_key = process.env.JWT_SECRET || "any_harcoded_secretkey";
    return jwt.sign(data, secret_key); // required to add token expiration time
}
