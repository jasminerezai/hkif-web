import bcrypt from 'bcryptjs';
import { prisma, ProfileRole } from '../db/prisma';
import { ApiError } from '../utils/ApiError';
import { generateToken } from '../utils/jwt';

/** Maps a Prisma Profile row to the public user DTO returned by auth endpoints. */
const toUserDto = (p: { id: string; email: string; profileName: string | null; role: ProfileRole }) => ({
  id: p.id,
  email: p.email,
  name: p.profileName,
  role: p.role,
});

export const register = async (email: string, password: string, name: string) => {
  // Check if user already exists
  const existingUser = await prisma.profile.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw ApiError.conflict('User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const newUser = await prisma.profile.create({
    data: {
      email,
      password: hashedPassword,
      profileName: name,
      // New registrations default to the lowest privilege level
      role: ProfileRole.MEMBER,
    },
  });

  // Generate token
  const token = generateToken(newUser.id, newUser.role);

  return { user: toUserDto(newUser), token };
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

  return { user: toUserDto(user), token };
};
