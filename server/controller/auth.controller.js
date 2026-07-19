import prisma from "../model/db.js";
import bcrypt from 'bcryptjs';
import redis from "../lib/redis.js";
import { generateToken } from "../lib/authHelper.js";
import countryList from "country-list";
import { purifyObject, sendMail, sendSMS, createAuditLog } from "../lib/others.js"
// If you want a practical production bar, I would require at least these before deploy:
// Remove the hardcoded JWT fallback and add token expiry.
// Add production cookie settings and make logout clear with the same options.
// Add email/phone verification before allowing full account use.

const signup = async (req, res) => {
  try {
    //during signup mobile no and email both are mendatory, both need to be verified
    const user = req.body.user;
    const mentor = req.body.mentor || null;
    console.log("Reached data ", req.body)
    if (mentor) {  // these details can never be decided by mentor or user
      delete mentor.rating;
      delete mentor.verified;
      delete mentor.expertise;
      delete mentor.level;
      delete mentor.no_of_consultancy;
    }
    if (!user) {
      return res.status(400).json({ success: false, message: "User data is required" });
    }
    if (!user.country || !countryList.getName(user.country)) {
      return res.status(400).json({ success: false, message: "Invalid or missing country code" });
    }
    if (mentor && mentor.charge && !mentor.currency) {
      return res.status(400).json({ success: false, message: "Please provide charge and currency" });
    }
    if (user.profession_category && !user.profession) {
      return res.status(400).json({ success: false, message: "Please provide profession" });
    }
    const alreadyExists = await prisma.users.findFirst({
      where: {
        OR: [
          { email: user.email },
          { phone: user.phone }
        ]
      }
    });

    if (alreadyExists) {
      return res
        .status(409)
        .json({
          success: false,
          message: "Account with this mail or ph no already exists. Either login or continue with different email!"
        });
    }
    console.log("req body ", req.body);
    if (user.role === 'MENTOR' && !mentor) {
      return res
        .status(409)
        .json({
          success: false,
          message: "Trying to create Mentor profile, but mentor field data is empty "
        });
    }
    purifyObject(user);
    if (user.dob) {
      user.dob = new Date(user.dob).toISOString();
    }
    if (mentor) {
      purifyObject(mentor);
      if (mentor.experience) mentor.experience = parseInt(mentor.experience, 10);
      if (mentor.available_from) mentor.available_from = new Date(`1970-01-01T${mentor.available_from}:00Z`).toISOString();
      if (mentor.available_to) mentor.available_to = new Date(`1970-01-01T${mentor.available_to}:00Z`).toISOString();
      if (mentor.charge) mentor.charge = parseFloat(mentor.charge);
    }

    console.log("Reached data before DB query  ", { user, mentor })
    const [createdUser, createdMentor] = await prisma.$transaction(async (trnsctn) => {
      const createdUser = await trnsctn.users.create({
        data: {
          ...user,
          password: await bcrypt.hash(user.password, parseInt(process.env.SALT_ROUNDS) || 10)
        }
      })
      if (user.role === 'MENTOR' && mentor) {
        const createdMentor = await trnsctn.mentor.create({
          data: {
            ...mentor,
            user: { connect: { id: BigInt(createdUser.id) } }
          }
        })

        return [createdUser, createdMentor];
      }
      return [createdUser, null];
    })
    await redis.del(`otp:${req.body.email}:verified`);
    await redis.del(`otp:${req.body.phone}:verified`);
    console.log("created user ", createdUser, "created mentor ", createdMentor)

    return res.
      status(201).
      json({
        success: true,
        message: "Sign up successful!"
      });
  }
  catch (error) {
    return res.status(500).json({ success: false, message: "Some Error occured during signup. Please try again later!", error: error.message })
  }
}

const login = async (req, res) => {
  try {
    const filter = {
      OR: [
        { email: req.body.email },
        { phone: req.body.phone }
      ],
      isactive: true
    };
    if (req.body.role === 'MENTOR' || req.body.role === 'ADMIN') {
      filter.role = req.body.role;
    }

    const user = await prisma.users.findFirst({
      where: filter
    });
    if (!user) return res.status(401).json({ success: false, message: "User not found, please create account" })
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid Credentials" })
    const data = {
      id: user.id.toString(),
      name: user.first_name + (user.middle_name ? ` ${user.middle_name} ` : " ") + user.last_name,
      role: user.role
    }
    const token = generateToken(data);
    data.image = user.image;
    data.gender = user.gender;
    return res.status(200).cookie(process.env.COOKIE_KEY, token, {
      signed: true,
      httpOnly: true,
      // secure: true,       // Ensures cookie is only sent over HTTPS
      // maxAge: 24 * 60 * 60 * 1000, removed to create a Session Cookie (expires on window close)
      // some othere thing also need to be added here as production purpose
      sameSite: 'strict'  // Protects against CSRF attacks, but how ??, difference with sameSite: lax
    }).json({ success: true, message: "Login Successful", data: data })
  }
  catch (error) {
    return res.status(500).json({ success: false, message: "Login Failed", error: error.message })
  }
}

const loadProfile = async (req, res) => {
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
    let data = { ...user };
    if (user.role === 'MENTOR') {
      const mentor = await prisma.mentor.findFirst({
        where: {
          user: { id: BigInt(req.params.id) }
        }
      });
      data = { ...data, ...mentor };
    }
    return res.status(200).json({ success: true, message: "Profile fetched successfully", data: data });
  }
  catch (error) {
    console.error("Error in loadProfile:", error.message);
    return res.status(500).json({ success: false, message: "Please try again later ", error: error.message })
  }
}
const updateProfile = async (req, res) => {
  try {
    console.log("request params ", req.params)
    console.log("request body ", req.body)
    const user = await prisma.users.findFirst({
      where: { id: BigInt(req.params.id) }
    });
    if (!user) return res.status(404).json({ success: false, message: "No user found" });
    // only allow user to update email or phone if old email or phone is verified
    const userData = req.body.user;
    const mentorData = req.body?.mentor || null;
    const audit = req.body.audit;
    const ip = req.ip || req.headers['x-forwarded-for'] || "Unknown";
    const device = req.headers['user-agent'] || "Unknown";

    if (userData) { // user shd never update these things
      delete userData.password;
      delete userData.id;
      delete userData.isactive;
      delete userData.created_at;
      delete userData.updated_at;
      delete userData.deleted_at;
    }

    const isEmailChanged = userData.email && user.email !== userData.email;
    const isPhoneChanged = userData.phone && user.phone !== userData.phone;

    //for now block user from changing mobile or email , this feature will be implemented later
    if (isEmailChanged || isPhoneChanged) {  //LATER
      return res.status(400).json({ success: false, message: "Cannot update email or phone number, this feature will be implemented later" });
    }


    if (isEmailChanged) {
      const emailVerified = await redis.get(`otp:${userData.email}:verified`);
      if (!emailVerified) {
        return res.status(400).json({ success: false, message: "New email must be verified via OTP before updating" });
      }
    }

    if (isPhoneChanged) {
      const phoneVerified = await redis.get(`otp:${userData.phone}:verified`);
      if (!phoneVerified) {
        return res.status(400).json({ success: false, message: "New phone number must be verified via OTP before updating" });
      }
    }

    purifyObject(userData);
    if (userData.dob) {
      userData.dob = new Date(userData.dob).toISOString();
    }
    if (userData.country && !countryList.getName(userData.country)) {
      return res.status(400).json({ success: false, message: "Invalid country code" });
    }

    if (mentorData) {
      delete mentorData.rating;
      delete mentorData.verified;
      delete mentorData.expertise;
      delete mentorData.level;
      delete mentorData.no_of_consultancy;
      purifyObject(mentorData);
      if (mentorData.experience) mentorData.experience = parseInt(mentorData.experience, 10);
      if (mentorData.available_from) mentorData.available_from = new Date(`1970-01-01T${mentorData.available_from}:00Z`).toISOString();
      if (mentorData.available_to) mentorData.available_to = new Date(`1970-01-01T${mentorData.available_to}:00Z`).toISOString();
      if (mentorData.charge) mentorData.charge = parseFloat(mentorData.charge);
    }

    const oldRole = user.role;
    const newRole = userData.role || oldRole;
    const switchingToMentor = oldRole !== 'MENTOR' && newRole === 'MENTOR';
    // const switchingFromMentor = oldRole === 'MENTOR' && newRole !== 'MENTOR';
    if((oldRole === 'MENTOR' || newRole === 'MENTOR') && mentorData) {
      mentorData.verified = false;
    }
    if (switchingToMentor && !mentorData) {
      return res.status(400).json({ success: false, message: "Mentor details are required when switching to Mentor role" });
    }

    const [updatedUser, updatedMentor] = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.users.update({
        where: { id: BigInt(req.params.id) },
        data: userData
      });

      let updatedMentor = null;
      if (newRole === 'MENTOR' && mentorData) {
        // USER -> MENTOR: create new mentor row
        console.log("Insie update mentor update tnxtcn ")
        updatedMentor = await tx.mentor.upsert({ // I need to know it well 
          where:{id: BigInt(updatedUser.id)},
          update: {
            ...mentorData
          },
          create:{
            ...mentorData,
            user: { connect: { id: BigInt(req.params.id) } }
          }
        })
        console.log("Updated mentor inside transaction ", updatedMentor)
       }

      return [updatedUser, updatedMentor];
    });

    // Clean OTP verification flags after successful update
    if (isEmailChanged) {
      await redis.del(`otp:${userData.email}:verified`);
      await sendSMS(user.phone, `Your Vriddhi account email was updated to ${userData.email}. If you did not make this change, contact support. at ${process.env.SUPPORT_MAIL}`);
    }
    if (isPhoneChanged) {
      await redis.del(`otp:${userData.phone}:verified`);
      await sendMail(user.email, "Vriddhi - Mobile Number Updated", `Your account mobile number was updated to ${userData.phone}. If you did not make this change, contact support. at ${process.env.SUPPORT_MAIL}`);
    }

    createAuditLog({
      table_name: "Users",
      record_id: updatedUser.id,
      action: "UPDATE",
      previous_data: user,
      updated_data: updatedUser,
      user_id: BigInt(audit.user_id),
      role: audit.role,
      ip_address: ip,
      device: device,
    });

    if (newRole === 'MENTOR' && mentorData) {
      const mentor = await prisma.mentor.findUnique({
        where: { id: BigInt(updatedMentor.id) }
      });
      createAuditLog({
        table_name: "Mentor",
        record_id: updatedMentor.id,
        action: "UPDATE",
        previous_data: mentor,
        updated_data: updatedMentor,
        user_id: BigInt(audit.user_id),
        role: audit.role,
        ip_address: ip,
        device: device,
      });
    }

    return res.status(200).json({ success: true, message: "Profile updated successfully", data: { user: { ...updatedUser }, mentor: updatedMentor ? { ...updatedMentor } : null } });
  }
  catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update, please try again later", error: error.message });
  }
}

const logout = (req, res) => {
  try {
    return res.status(200).clearCookie(process.env.COOKIE_KEY).json({ success: true, message: "Logged out " })
  }
  catch (error) {
    return res.status(500).json({ success: false, message: " Unable to logout, try again later" })
  }
}

const changePassword = async (req, res) => {
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

const deActivateProfile = async (req, res) => {
  try {
    // just deactivate the account, verify both email and no before deactivating the account
    const deactivatedUser = await prisma.users.update({
      where: { id: BigInt(req.params.id) },
      data: { isactive: false } // here also fill profile with dummy data after deactivating the profile
    })
    return res.clearCookie(process.env.COOKIE_KEY).status(200).json({ success: !deactivatedUser.isactive, message: deactivatedUser.isactive ? "Unable to deactivate the profile" : "Profile is deleted successfully " });
  }
  catch (error) {
    return res.status(500).json({ success: false, message: "Unknown error occurred, try again later", error: error })
  }
}

const resetPassword = async (req, res) => {
  try {
    const user = await prisma.users.findFirst({
      where: {
        AND: [
          { email: req.body.email },
          { phone: req.body.phone }
        ]
      }
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
    const updatedUser = await prisma.users.update({
      where: { id: BigInt(user.id) },
      data: { password: await bcrypt.hash(req.body.password, parseInt(process.env.SALT_ROUNDS || 10)) }
    });
    await redis.del(`otp:${req.body.email}:verified`);
    await redis.del(`otp:${req.body.phone}:verified`);
    console.log("updated user ", updatedUser);
    return res.status(200).json({ success: true, message: "Password reset successfully " })
  }
  catch (error) {
    console.error("Error in resetPassword: ", error);
    return res.status(500).json({ success: false, message: "Unable to reset password", error: error?.message || "Unknown error" })
  }
}

export { signup, login, loadProfile, updateProfile, logout, changePassword, deActivateProfile, resetPassword };