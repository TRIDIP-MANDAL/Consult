import prisma from "../model/db.js"
import redis from "../lib/redis.js"
export const contactus = async (req, res) =>{
  try{
      const data = req.body
      const result = await prisma.contactUs.create({
        data
      })
      await redis.del(`otp:${req.body.email}:verified`);
      return res.status(201).json({message: "Message sent successfully, our team will soon contact you", success: true, result});
  }catch(err){
      console.log(err)
      return res.status(500).json({message: "Internal server error", success: false, error: err.message})
  }
}

export const getContacts = async (req, res)=>{
  try{
      
  }catch(err){
    
  }
}
export const getContact = async (req, res)=>{
  try{
      
  }catch(err){
    
  }
}
export const updateContact = async (req, res)=>{
  try{
      
  }catch(err){
    
  }
}
export const deleteContact = async (req, res)=>{
  try{
      
  }catch(err){
    
  }
}