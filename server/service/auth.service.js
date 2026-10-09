import bcrypt from 'bcryptjs';
import countryList from 'country-list';
import redis from '../lib/redis.js';
import { generateToken, isStrongPassword } from '../lib/authHelper.js';
import { purifyObject } from '../lib/others.js';
import {
  findUserByEmailOrPhone,
  findUserByFilter,
  updateUser,
  createUserWithMentor,
} from '../repository/auth.repository.js';
import {
  ValidationError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../exception/AppError.js';

const signup = async ({ user, mentor }) => {
  if (!user) throw new ValidationError('User data is required');
  if (!user.country || !countryList.getName(user.country)) {
    throw new ValidationError('Invalid or missing country code');
  }
  if (mentor && mentor.charge && !mentor.currency) {
    throw new ValidationError('Please provide charge and currency');
  }
  if (user.profession_category && !user.profession) {
    throw new ValidationError('Please provide profession');
  }

  const email = user.email;
  const phone = user.phone;

  if (mentor) {
    delete mentor.rating;
    delete mentor.verified;
    delete mentor.expertise;
    delete mentor.level;
    delete mentor.no_of_consultancy;
  }

  const alreadyExists = await findUserByEmailOrPhone(email, phone);
  if (alreadyExists) {
    throw new ConflictError(
      'Account with this mail or ph no already exists. Either login or continue with different email!'
    );
  }

  if (user.role === 'MENTOR' && !mentor) {
    throw new ConflictError(
      'Trying to create Mentor profile, but mentor field data is empty'
    );
  }

  purifyObject(user);
  if (user.dob) user.dob = new Date(user.dob).toISOString();

  if (mentor) {
    purifyObject(mentor);
    if (mentor.experience) mentor.experience = parseInt(mentor.experience, 10);
    if (mentor.available_from)
      mentor.available_from = new Date(`1970-01-01T${mentor.available_from}:00Z`).toISOString();
    if (mentor.available_to)
      mentor.available_to = new Date(`1970-01-01T${mentor.available_to}:00Z`).toISOString();
    if (mentor.charge) mentor.charge = parseFloat(mentor.charge);
  }

  if(!isStrongPassword(user.password)){
    throw new ValidationError('Password is too weak');
  }
  
  const hashedPassword = await bcrypt.hash(
    user.password,
    parseInt(process.env.SALT_ROUNDS) || 10
  );

  await createUserWithMentor({ ...user, password: hashedPassword }, mentor || null);

  await redis.del(`otp:${email}:verified`);
  await redis.del(`otp:${phone}:verified`);
};

const login = async ({ email, phone, password, role }) => {
  const filter = {
    OR: [{ email }, { phone }],
    isactive: true
  };
  if (role === 'MENTOR' || role === 'ADMIN') {
    filter.role = role;
  }

  const user = await findUserByFilter(filter);
  if (!user) throw new UnauthorizedError('User not found, please create account');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new UnauthorizedError('Invalid Credentials');

  const tokenPayload = {
    id: user.id.toString(),
    name: user.full_name,
    role: user.role
  };
  const token = generateToken(tokenPayload);

  const data = {
    ...tokenPayload,
    image: user.image,
    gender: user.gender
  };

  return { token, data };
};

const resetPassword = async ({ email, phone, password }) => {
  const user = await findUserByFilter({
    OR: [{ email }, { phone }]
  });
  if (!user) throw new NotFoundError('User not found');

  const updatedUser = await updateUser(user.id, {
    password: await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS || 10))
  });

  await redis.del(`otp:${email}:verified`);
  await redis.del(`otp:${phone}:verified`);

  return updatedUser;
};

export {
  signup,
  login,
  resetPassword,
};
