import { BaseEntity } from './common';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface UserResponse extends BaseEntity {
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: UserResponse;
  message: string;
}

