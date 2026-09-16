export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
}
