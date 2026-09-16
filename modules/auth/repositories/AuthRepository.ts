import { prisma } from "@/lib/prisma";

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: { email: string; name: string; passwordHash: string }) {
    return prisma.user.create({
      data,
    });
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { email },
    });
    return count > 0;
  }
}

export const authRepository = new AuthRepository();
