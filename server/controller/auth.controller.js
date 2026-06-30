import prisma from "../model/db.js";
import bcrypt from 'bcryptjs';
import { generateToken } from "../lib/authHelper.js";
//check user already exists or not, this part is repetitive, this can be wrapped inside a common function
// If you want a practical production bar, I would require at least these before deploy:
// Remove the hardcoded JWT fallback and add token expiry.
// Add production cookie settings and make logout clear with the same options.
// Add input validation for signup/login.
// Add email/phone verification before allowing full account use.

export const signup = async (req, res) => {
  try {
    //during signup mobile no and email both are mendatory, both need to be verified
    // for verification purposr I have to create api for send otp and verify otp, then have to set their response.
    // also need to store that otp in DB (either redis or DB, have to make change in schema)
    //  email verify 
    //email, name, password , role 
    const user = req.body.user;
    const mentor = req.body.mentor || null;
    const document = req.body.docuemnt || null;
    // add a column for user ( Country, state, district , address, postal code)
    const alreadyExists = await prisma.users.findFirst({
      where: {
        OR: [
          { email: user.email },
          { phone: user.phone }
        ]
      }
    });

    if (alreadyExists) return res.status(409).json({ message: "Account with this mail or ph no already exists. Either login or continue with different email!" });
    console.log(" salt ", typeof process.env.SALT_ROUNDS)
    user.password = await bcrypt.hash(user.password, parseInt(process.env.SALT_ROUNDS) || 10)
    // here we need to verify the mail or mobile no via otp
    console.log("req body ", req.body);
    console.log("password ", user.password);
    const createdUser = await prisma.users.create({
      data: user
    })
    // add admin creation logic by checking that admin creation is done by admin or not
    if (user.role === 'MENTOR' && mentor && document) {
      document.userId = BigInt(createdUser.id);
      const createdMentor = await prisma.mentor.create({
        data: {
          ...mentor,
          user: {
            connect: { id: BigInt(createdUser.id) }
          }
        }
      })
      console.log("mentor created ", createdMentor)
      const createdDocument = await prisma.document.create({ data: document })
      console.log("created document ", createdDocument)
    }
    return res.status(201).json({ message: "Sign up successful!" });
  }
  catch (error) {
    return res.status(500).json({ message: "Some Error occured during signup. Please try again later!", error: error.message })
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
    if (!user) return res.status(401).json({ message: "User not found, please create account" })
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid Credentials" })
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
    }).json({ message: "Login Successful ", data: data })
  }
  catch (error) {
    return res.status(501).json({ message: "Login Failed", error: error.message })
  }
}
// loadprofile done
export const loadProfile = async (req, res) => {
  try {
    console.log("request params ", req.params)
    const user = await prisma.users.findFirst({
      where: {
        id: BigInt(req.params.id)
      }
    });
    console.log(user)
    if (!user || !user?.isactive) return res.status(404).json({ message: "No user found" })
    // return if user is mentor or admin, that details also need to fbe fetched and returned
    delete user.password;
    return res.status(200).json({ message: "Profile fetched successfully", data: { ...user, id: user.id.toString() } })
  }
  catch (error) {
    console.error("Error in loadProfile:", error.message);
    return res.status(500).json({ message: "Please try again later ", error: error.message })
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
    if (!user) return res.status(201).json({ message: "No user found" })
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
    // return res.status(201).json({message:"Done "})
    return res.status(201).json({ message: "User profile updated successfully ", data: { user: { ...updatedUser, id: updatedUser.id.toString() }, mentor: { ...updatedMentor, id: updatedMentor?.id.toString() } } })
  }
  catch (error) {
    return res.status(500).json({ message: "Please try again later ", error: error.message })
  }
}

export const logout = (req, res) => {
  try {
    return res.status(200).clearCookie(process.env.COOKIE_KEY).json({ message: "Logged out " })
  }
  catch (error) {
    return res.status(500).json({ message: " Unable to logout, try again later" })
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
    return res.status(201).json({ message: "User password updated successfully " })
  }
  catch (error) {
    return res.status(501).json({ message: "uanable to change user password  ", error: error })
  }
}

export const deActivateProfile = async (req, res) => {
  try {
    // just deactivate the account, verify both email and no before deactivating the account
    const deactivatedUser = await prisma.users.update({
      where: { id: BigInt(req.params.id) },
      data: { isactive: false }
    })
    return res.status(201).json({ message: deactivatedUser.isactive ? "Unable to deactivate the profile" : "Profile is deleted successfully " });
  }
  catch (error) {
    return res.status(501).json({ message: "Unknown error occurred, try again later", error: error })
  }
}