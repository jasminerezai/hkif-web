import bcrypt from 'bcryptjs';
import { prisma, ProfileRole } from '../db/prisma';
import { ApiError } from '../utils/ApiError';
import { generateToken } from '../utils/jwt';

export const register = async (email: string, password: string, profileName: string) => {
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
      profileName,
      // Defaulting to USER role
      role: ProfileRole.USER,
    },
  });

  // Generate token
  const token = generateToken(newUser.id, newUser.role);

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.profileName,
      role: newUser.role,
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
  const token = generateToken(user.id, user.role);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.profileName,
      role: user.role,
    },
    token,
  };
};
