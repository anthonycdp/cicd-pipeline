import { v4 as uuidv4 } from 'uuid';
import { createError } from '../middleware/errorHandler';
import { CreateUserDto, UpdateUserDto, User } from '../types';

const DEFAULT_USER = {
  name: 'John Doe',
  email: 'john@example.com',
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const users = new Map<string, User>();

const createStoredUser = (name: string, email: string): User => {
  const now = new Date();

  return {
    id: uuidv4(),
    name,
    email,
    createdAt: now,
    updatedAt: now,
  };
};

const seedUserStore = (): void => {
  const seedUser = createStoredUser(DEFAULT_USER.name, DEFAULT_USER.email);
  users.set(seedUser.id, seedUser);
};

const normalizeName = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ');
};

const normalizeEmail = (value: string): string => {
  return value.trim().toLowerCase();
};

const findUserByEmail = (email: string, excludedUserId?: string): User | undefined => {
  return Array.from(users.values()).find((user) => {
    return user.email === email && user.id !== excludedUserId;
  });
};

const ensureUserExists = (id: string): User => {
  const user = users.get(id);

  if (!user) {
    throw createError('User not found', 404);
  }

  return user;
};

const validateCreateUserInput = (input: CreateUserDto): { name: string; email: string } => {
  const name = normalizeName(input.name ?? '');
  const email = normalizeEmail(input.email ?? '');

  if (!name || !email) {
    throw createError('Name and email are required', 400);
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw createError('Email must be valid', 400);
  }

  return { name, email };
};

const validateUpdateUserInput = (
  input: UpdateUserDto,
  currentUser: User
): Partial<Pick<User, 'name' | 'email'>> => {
  const updates: Partial<Pick<User, 'name' | 'email'>> = {};

  if (input.name !== undefined) {
    const name = normalizeName(input.name);
    if (!name) {
      throw createError('Name cannot be empty', 400);
    }
    updates.name = name;
  }

  if (input.email !== undefined) {
    const email = normalizeEmail(input.email);
    if (!email) {
      throw createError('Email cannot be empty', 400);
    }
    if (!EMAIL_PATTERN.test(email)) {
      throw createError('Email must be valid', 400);
    }
    updates.email = email;
  }

  if (Object.keys(updates).length === 0) {
    throw createError('At least one field must be provided', 400);
  }

  if (
    updates.email &&
    updates.email !== currentUser.email &&
    findUserByEmail(updates.email, currentUser.id)
  ) {
    throw createError('Email already in use', 409);
  }

  return updates;
};

seedUserStore();

export const resetUserStore = (): void => {
  users.clear();
  seedUserStore();
};

export const listUsers = (): User[] => {
  return Array.from(users.values());
};

export const getUserById = (id: string): User => {
  return ensureUserExists(id);
};

export const createUser = (input: CreateUserDto): User => {
  const { name, email } = validateCreateUserInput(input);

  if (findUserByEmail(email)) {
    throw createError('User with this email already exists', 409);
  }

  const user = createStoredUser(name, email);
  users.set(user.id, user);

  return user;
};

export const updateUser = (id: string, input: UpdateUserDto): User => {
  const existingUser = ensureUserExists(id);
  const updates = validateUpdateUserInput(input, existingUser);

  const updatedUser: User = {
    ...existingUser,
    ...updates,
    updatedAt: new Date(),
  };

  users.set(id, updatedUser);

  return updatedUser;
};

export const deleteUser = (id: string): void => {
  ensureUserExists(id);
  users.delete(id);
};
