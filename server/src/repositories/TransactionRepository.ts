

import { BaseRepository } from './base/BaseRepository';
import { Transaction as PrismaTransaction } from '@prisma/client';

export class TransactionRepository extends BaseRepository<PrismaTransaction> {
  protected modelName = 'transaction';

  
  public async findByUserId(userId: string): Promise<PrismaTransaction[]> {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  
  public async findByTradeId(
    tradeId: string
  ): Promise<PrismaTransaction[]> {
    return this.prisma.transaction.findMany({
      where: { tradeId },
    });
  }

  
  public async getUserSummary(userId: string): Promise<{
    totalDeposits: number;
    totalWithdrawals: number;
    totalTradeBuys: number;
    totalTradeSells: number;
  }> {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
    });

    return {
      totalDeposits: transactions
        .filter((t) => t.transactionType === 'DEPOSIT')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      totalWithdrawals: transactions
        .filter((t) => t.transactionType === 'WITHDRAWAL')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      totalTradeBuys: transactions
        .filter((t) => t.transactionType === 'TRADE_BUY')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      totalTradeSells: transactions
        .filter((t) => t.transactionType === 'TRADE_SELL')
        .reduce((sum, t) => sum + Number(t.amount), 0),
    };
  }
}
