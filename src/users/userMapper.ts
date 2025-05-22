import { User, UserResponse } from '../types';

export const toUserResponse = (user: User): UserResponse => {
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
};

export const toUserResponseList = (users: User[]): UserResponse[] => {
  return users.map(toUserResponse);
};
