import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { authRepository } from "../repositories/AuthRepository";
import { LoginDto } from "../dto/LoginDto";
import { RegisterDto } from "../dto/RegisterDto";
import { badRequest, unauthorized } from "@/lib/http/errors";
import type { AuthResult, AuthTokenPayload, AuthUser } from "../types/auth.types";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export class AuthService {
  async register(dto: RegisterDto): Promise<AuthResult> {
    const exists = await authRepository.emailExists(dto.email);
    if (exists) {
      throw badRequest("Email already registered");
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await authRepository.createUser({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });

    const token = await this.generateToken({ userId: user.id, email: user.email });

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await authRepository.findUserByEmail(dto.email);
    if (!user) {
      throw unauthorized("Invalid email or password");
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw unauthorized("Invalid email or password");
    }

    const token = await this.generateToken({ userId: user.id, email: user.email });

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }

  async verifyToken(token: string): Promise<AuthTokenPayload> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload as unknown as AuthTokenPayload;
    } catch {
      throw unauthorized("Invalid or expired token");
    }
  }

  async getUserFromToken(token: string): Promise<AuthUser | null> {
    const payload = await this.verifyToken(token);
    const user = await authRepository.findUserById(payload.userId);
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name };
  }

  private async generateToken(payload: AuthTokenPayload): Promise<string> {
    return new SignJWT(payload as unknown as Record<string, unknown>)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(JWT_EXPIRES_IN)
      .setIssuedAt()
      .sign(JWT_SECRET);
  }
}

export const authService = new AuthService();
