import prisma from "../model/db.js";
import bcrypt from 'bcryptjs';
import { generateToken } from "../lib/authHelper.js";
import countryList from "country-list";
// If you want a practical production bar, I would require at least these before deploy:
// Remove the hardcoded JWT fallback and add token expiry.
// Add production cookie settings and make logout clear with the same options.
// Add input validation for signup/login.
// Add email/phone verification before allowing full account use.

export const signup = async (req, res) => {
  try {
    //during signup mobile no and email both are mendatory, both need to be verified
    const user = req.body.user;
    const mentor = req.body.mentor || null;

    if (!user.country || !countryList.getName(user.country)) {
      return res.status(400).json({ success: false, message: "Invalid or missing country code" });
    }

    const alreadyExists = await prisma.users.findFirst({
      where: {
        OR: [
          { email: user.email },
          { phone: user.phone }
        ]
      }
    });

    if (alreadyExists) return res.status(409).json({ success: false, message: "Account with this mail or ph no already exists. Either login or continue with different email!" });
    user.password = await bcrypt.hash(user.password, parseInt(process.env.SALT_ROUNDS) || 10)
    console.log("req body ", req.body);
    const createdUser = await prisma.users.create({
      data: user
    })
    // add admin creation logic by checking that admin creation is done by admin or not
    if (user.role === 'MENTOR' && mentor) {
      const createdMentor = await prisma.mentor.create({
        data: {
          ...mentor,
          user: {
            connect: { id: BigInt(createdUser.id) }
          }
        }
      })
      console.log("mentor created ", createdMentor)
    }
    return res.status(201).json({ success: true, message: "Sign up successful!" });
  }
  catch (error) {
    return res.status(500).json({ success: false, message: "Some Error occured during signup. Please try again later!", error: error.message })
  }
}

export const login = async (req, res) => {
  try {
    // verify username & pass
    // here we will also verify is suer logging in as mentor or user or admin
    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { email: req.body.email },
          { phone: req.body.phone }
        ],
        role: req.body.role
      }
    });
    if (!user) return res.status(401).json({ success: false, message: "User not found, please create account" })
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid Credentials" })
    const data = {
      id: user.id.toString(),
      name: user.first_name + " " + user.last_name,
      role: user.role
    }
    const token = generateToken(data);
    return res.status(200).cookie(process.env.COOKIE_KEY, token, {
      signed: true,
      httpOnly: true,
      // secure: true,       // Ensures cookie is only sent over HTTPS
      maxAge: 24 * 60 * 60 * 1000, // or check if required to add expiresIN 
      // some othere thing also need to be added here as production purpose
      sameSite: 'strict'  // Protects against CSRF attacks, but how ??, difference with sameSite: lax
    }).json({ success: true, message: "Login Successful ", data: data })
  }
  catch (error) {
    return res.status(500).json({ success: false, message: "Login Failed", error: error.message })
  }
}

export const loadProfile = async (req, res) => {
  try {
    console.log("request params ", req.params)
    const user = await prisma.users.findFirst({
      where: {
        id: BigInt(req.params.id)
      }
    });
    console.log(user)
    if (!user || !user?.isactive) return res.status(404).json({ success: false, message: "No user found" })
    // return if user is mentor or admin, that details also need to fbe fetched and returned
    delete user.password;
    return res.status(200).json({ success: true, message: "Profile fetched successfully", data: { ...user, id: user.id.toString() } })
  }
  catch (error) {
    console.error("Error in loadProfile:", error.message);
    return res.status(500).json({ success: false, message: "Please try again later ", error: error.message })
  }
}
//not done
export const updateProfile = async (req, res) => {
  // add functionality, cannot update both mobile no and email at time
  try {
    console.log("request params ", req.params)
    console.log("request body ", req.body)
    const user = await prisma.users.findFirst({
      where: {
        id: BigInt(req.params.id)
      }
    });
    if (!user) return res.status(404).json({ success: false, message: "No user found" })
    let updatedMentor = null;
    if (user.role === "MENTOR" && req.body.mentor) {
      updatedMentor = await prisma.mentor.update({
        where: { id: BigInt(req.params.id) },
        data: req.body?.mentor
      })
    }
    if (req.body?.user) delete req.body.user.password;
    const updatedUser = await prisma.users.update({
      where: { id: BigInt(req.params.id) },
      data: req.body?.user // might need to be cross verified or might contain bug
    });
    console.log(updatedUser)
    return res.status(200).json({ success: true, message: "User profile updated successfully ", data: { user: { ...updatedUser, id: updatedUser.id.toString() }, mentor: { ...updatedMentor, id: updatedMentor?.id.toString() } } })
  }
  catch (error) {
    return res.status(500).json({ success: false, message: "Please try again later ", error: error.message })
  }
}

export const logout = (req, res) => {
  try {
    return res.status(200).clearCookie(process.env.COOKIE_KEY).json({ success: true, message: "Logged out " })
  }
  catch (error) {
    return res.status(500).json({ success: false, message: " Unable to logout, try again later" })
  }
}

export const changePassword = async (req, res) => {
  try {
    // forgot password logic required here
    // first enter new password, then reenter new password, and that logic will be handled from frontend, if success then only the API hit will be done
    // current password check
    // password and re-entered new password check and then only write in db
    const updatedUser = await prisma.users.update({
      where: { id: BigInt(req.params.id) },
      data: { password: await bcrypt.hash(req.body.password, process.env.SALT_ROUNDS || 10) } // might need to be cross verified or might contain bug
    });
    return res.status(200).json({ success: true, message: "User password updated successfully " })
  }
  catch (error) {
    return res.status(500).json({ success: false, message: "Unable to change user password", error: error })
  }
}

export const deActivateProfile = async (req, res) => {
  try {
    // just deactivate the account, verify both email and no before deactivating the account
    const deactivatedUser = await prisma.users.update({
      where: { id: BigInt(req.params.id) },
      data: { isactive: false }
    })
    return res.status(200).json({ success: !deactivatedUser.isactive, message: deactivatedUser.isactive ? "Unable to deactivate the profile" : "Profile is deleted successfully " });
  }
  catch (error) {
    return res.status(500).json({ success: false, message: "Unknown error occurred, try again later", error: error })
  }
}