

import { BaseRepository } from './base/BaseRepository';
import { Wallet as PrismaWallet } from '@prisma/client';

export class WalletRepository extends BaseRepository<PrismaWallet> {
  protected modelName = 'wallet';

  
  public async findByUserId(userId: string): Promise<PrismaWallet | null> {
    return this.prisma.wallet.findUnique({ where: { userId } });
  }

  
  public async createForUser(
    userId: string,
    initialBalance: number = 0
  ): Promise<PrismaWallet> {
    return this.prisma.wallet.create({
      data: {
        userId,
        balance: initialBalance,
        reservedBalance: 0,
      },
    });
  }

  
  public async updateBalance(
    userId: string,
    balance: number,
    reservedBalance: number
  ): Promise<PrismaWallet> {
    return this.prisma.wallet.update({
      where: { userId },
      data: { balance, reservedBalance },
    });
  }

  
  public async incrementBalance(
    userId: string,
    amount: number
  ): Promise<PrismaWallet> {
    return this.prisma.wallet.update({
      where: { userId },
      data: { balance: { increment: amount } },
    });
  }

  
  public async decrementBalance(
    userId: string,
    amount: number
  ): Promise<PrismaWallet> {
    return this.prisma.wallet.update({
      where: { userId },
      data: { balance: { decrement: amount } },
    });
  }

  
  public async reserveFunds(
    userId: string,
    amount: number
  ): Promise<PrismaWallet> {
    return this.prisma.wallet.update({
      where: { userId },
      data: { reservedBalance: { increment: amount } },
    });
  }

  
  public async releaseFunds(
    userId: string,
    amount: number
  ): Promise<PrismaWallet> {
    return this.prisma.wallet.update({
      where: { userId },
      data: { reservedBalance: { decrement: amount } },
    });
  }
}
