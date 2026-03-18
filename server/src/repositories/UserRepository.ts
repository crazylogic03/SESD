

import { BaseRepository } from './base/BaseRepository';
import { User as PrismaUser } from '@prisma/client';

export class UserRepository extends BaseRepository<PrismaUser> {
  protected modelName = 'user';

  
  public async findByUsername(username: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  
  public async findByEmail(email: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  
  public async findWithWallet(id: string): Promise<PrismaUser & { wallet: any } | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { wallet: true },
    });
  }

  
  public async findAllTraders(): Promise<PrismaUser[]> {
    return this.prisma.user.findMany({ where: { role: 'TRADER' } });
  }

  
  public async countByRole(role: string): Promise<number> {
    return this.prisma.user.count({ where: { role: role as any } });
  }
}
