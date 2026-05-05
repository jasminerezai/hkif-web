import bcrypt from 'bcryptjs';
import { prisma, prof_role } from '../db/prisma';
import { ApiError } from '../utils/ApiError';
import { generateToken } from '../utils/jwt';

export const register = async (email: string, password: string, profile_name: string) => {
  // Check if user already exists
  const existingUser = await prisma.profile.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw ApiError.conflict('User with this email already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const newUser = await prisma.profile.create({
    data: {
      email,
      password: hashedPassword,
      profile_name,
      // Defaulting to USER role
      profile_role: prof_role.USER,
    },
  });

  // Generate token
  const token = generateToken(newUser.profile_id, newUser.profile_role);

  return {
    user: {
      id: newUser.profile_id,
      email: newUser.email,
      name: newUser.profile_name,
      role: newUser.profile_role,
    },
    token,
  };
};

export const login = async (email: string, password: string) => {
  // Find user
  const user = await prisma.profile.findUnique({
    where: { email },
  });

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user.profile_id, user.profile_role);

  return {
    user: {
      id: user.profile_id,
      email: user.email,
      name: user.profile_name,
      role: user.profile_role,
    },
    token,
  };
};
