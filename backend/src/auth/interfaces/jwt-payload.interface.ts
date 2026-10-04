import { RoleType } from '../../database/entities';

export interface JwtPayload {
  sub: string;
  email: string;
  fullName: string;
  role: RoleType;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: RoleType;
  };
}
