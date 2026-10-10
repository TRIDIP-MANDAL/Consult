import bcrypt from 'bcryptjs';
import countryList from 'country-list';
import redis from '../lib/redis.js';
import { purifyObject, sendMail, sendSMS, createAuditLog, normalizeName } from '../lib/others.js';
import {
  findUserById,
  updateUser,
  updateUserWithMentor,
  findMentorByUserId,
  findMentorById,
  findMentors,
  searchTier1,
  searchTier2,
} from '../repository/auth.repository.js';
import {
  ValidationError,
  NotFoundError,
} from '../exception/AppError.js';

const MINIMUM_RCMNDTN_SRCH = 3;
const MAX_QUERY_LENGTH = 20;
const CACHE_TTL_SECONDS = 60;

const loadProfile = async (id) => {
  const user = await findUserById(id);
  if (!user || !user?.isactive) throw new NotFoundError('No user found');

  delete user.password;
  let data = { ...user };

  if (user.role === 'MENTOR') {
    const mentor = await findMentorByUserId(id);
    data = { ...data, ...mentor };
  }

  return data;
};

const updateProfile = async ({ id, userData, mentorData, audit, ip, device }) => {
  const user = await findUserById(id);
  if (!user) throw new NotFoundError('No user found');

  if (userData) {
    delete userData.password;
    delete userData.id;
    delete userData.isactive;
    delete userData.created_at;
    delete userData.updated_at;
    delete userData.deleted_at;
  }

  const isEmailChanged = userData.email && user.email !== userData.email;
  const isPhoneChanged = userData.phone && user.phone !== userData.phone;

  // Feature currently blocked — same guard as original controller
  if (isEmailChanged || isPhoneChanged) {
    throw new ValidationError(
      'Cannot update email or phone number, this feature will be implemented later'
    );
  }

  if (isEmailChanged) {
    const emailVerified = await redis.get(`otp:${userData.email}:verified`);
    if (!emailVerified) {
      throw new ValidationError('New email must be verified via OTP before updating');
    }
  }

  if (isPhoneChanged) {
    const phoneVerified = await redis.get(`otp:${userData.phone}:verified`);
    if (!phoneVerified) {
      throw new ValidationError('New phone number must be verified via OTP before updating');
    }
  }

  purifyObject(userData);
  if (userData.dob) userData.dob = new Date(userData.dob).toISOString();
  if (userData.country && !countryList.getName(userData.country)) {
    throw new ValidationError('Invalid country code');
  }

  if (mentorData) {
    delete mentorData.rating;
    delete mentorData.verified;
    delete mentorData.expertise;
    delete mentorData.level;
    delete mentorData.no_of_consultancy;
    purifyObject(mentorData);
    if (mentorData.experience) mentorData.experience = parseInt(mentorData.experience, 10);
    if (mentorData.available_from)
      mentorData.available_from = new Date(`1970-01-01T${mentorData.available_from}:00Z`).toISOString();
    if (mentorData.available_to)
      mentorData.available_to = new Date(`1970-01-01T${mentorData.available_to}:00Z`).toISOString();
    if (mentorData.charge) mentorData.charge = parseFloat(mentorData.charge);
  }

  const oldRole = user.role;
  const newRole = userData.role || oldRole;
  const switchingToMentor = oldRole !== 'MENTOR' && newRole === 'MENTOR';

  if ((oldRole === 'MENTOR' || newRole === 'MENTOR') && mentorData) {
    mentorData.verified = false;
  }
  if (switchingToMentor && !mentorData) {
    throw new ValidationError('Mentor details are required when switching to Mentor role');
  }

  const [updatedUser, updatedMentor] = await updateUserWithMentor(
    id,
    userData,
    newRole === 'MENTOR' && mentorData ? mentorData : null
  );

  if (isEmailChanged) {
    await redis.del(`otp:${userData.email}:verified`);
    await sendSMS(
      user.phone,
      `Your Vriddhi account email was updated to ${userData.email}. If you did not make this change, contact support. at ${process.env.SUPPORT_MAIL}`
    );
  }
  if (isPhoneChanged) {
    await redis.del(`otp:${userData.phone}:verified`);
    await sendMail(
      user.email,
      'Vriddhi - Mobile Number Updated',
      `Your account mobile number was updated to ${userData.phone}. If you did not make this change, contact support. at ${process.env.SUPPORT_MAIL}`
    );
  }

  createAuditLog({
    table_name: 'Users',
    record_id: updatedUser.id,
    action: 'UPDATE',
    previous_data: user,
    updated_data: updatedUser,
    user_id: BigInt(audit.user_id),
    role: audit.role,
    ip_address: ip,
    device,
  });

  if (newRole === 'MENTOR' && mentorData && updatedMentor) {
    const mentorBefore = await findMentorByUserId(id);
    createAuditLog({
      table_name: 'Mentor',
      record_id: updatedMentor.id,
      action: 'UPDATE',
      previous_data: mentorBefore,
      updated_data: updatedMentor,
      user_id: BigInt(audit.user_id),
      role: audit.role,
      ip_address: ip,
      device,
    });
  }

  return {
    user: { ...updatedUser },
    mentor: updatedMentor ? { ...updatedMentor } : null
  };
};

const changePassword = async (id, password) => {
  return updateUser(id, {
    password: await bcrypt.hash(password, process.env.SALT_ROUNDS || 10)
  });
};

const deActivateProfile = async (id) => {
  return updateUser(id, { isactive: false });
};

const loadMentors = async (query) => {
  // redis caching required
  // client side caching required
  // profession category, profession, country, price, rating, experience, expertise
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 8;

  const whereCondition = { active_mentor: true };

  if (query.verified !== undefined) whereCondition.verified = query.verified === 'true';
  if (query.expertise) whereCondition.expertise = query.expertise;
  if (query.experience) whereCondition.experience = { gte: Number(query.experience) };
  if (query.rating) whereCondition.rating = { gte: Number(query.rating) };
  if (query.price) whereCondition.charge = { lte: Number(query.price) };

  const userFilter = {};
  if (query.profession_category) userFilter.profession_category = query.profession_category;
  if (query.profession)
    userFilter.profession = { contains: String(query.profession), mode: 'insensitive' };
  if (query.country) userFilter.country = query.country;
  if (query.search) {
    const normalizedSearch = normalizeName(query.search.toString());
    if (normalizedSearch) {
      userFilter.full_name_search = { contains: normalizedSearch, mode: 'insensitive' };
    }
  }

  if (Object.keys(userFilter).length > 0) whereCondition.user = userFilter;

  return findMentors({ whereCondition, page, limit });
};

const searchMentorSuggestions = async (rawQuery) => {
  const raw = rawQuery?.toString().trim();

  if (!raw || raw.length < 1) return [];
  if (raw.length > MAX_QUERY_LENGTH) throw new ValidationError('Query too long');

  const q = normalizeName(raw);
  if (!q) return [];

  const cacheKey = `search:mentors:${q}`;

  if (redis) {
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached);
  }

  const prefixPattern = q + '%';
  const wordPrefixPattern = '% ' + q + '%';
  const levThreshold = q.length <= 3 ? 1 : 2;

  let rows = await searchTier1(q, prefixPattern, wordPrefixPattern);
  if (rows.length < MINIMUM_RCMNDTN_SRCH) {
    rows = await searchTier2(q, prefixPattern, wordPrefixPattern, levThreshold);
  }

  if (redis) {
    redis.set(cacheKey, JSON.stringify(rows), 'EX', CACHE_TTL_SECONDS).catch((err) => {
      console.error('searchMentorSuggestions: redis cache set failed', err);
    });
  }

  return rows;
};

const loadMentorProfile = async (id) => {
  const mentor = await findMentorById(id);
  if (!mentor || !mentor.active_mentor) {
    throw new NotFoundError('Mentor profile not found or inactive');
  }
  return mentor;
};

export {
  loadProfile,
  updateProfile,
  changePassword,
  deActivateProfile,
  loadMentors,
  searchMentorSuggestions,
  loadMentorProfile,
};
