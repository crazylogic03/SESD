

import { BaseRepository } from './base/BaseRepository';
import { Trade as PrismaTrade } from '@prisma/client';

export class TradeRepository extends BaseRepository<PrismaTrade> {
  protected modelName = 'trade';

  
  public async findByUserId(userId: string): Promise<PrismaTrade[]> {
    return this.prisma.trade.findMany({
      where: {
        OR: [
          { buyOrder: { userId } },
          { sellOrder: { userId } },
        ],
      },
      include: {
        buyOrder: { select: { userId: true, side: true } },
        sellOrder: { select: { userId: true, side: true } },
      },
      orderBy: { executedAt: 'desc' },
    });
  }

  
  public async findRecent(limit: number = 20): Promise<PrismaTrade[]> {
    return this.prisma.trade.findMany({
      orderBy: { executedAt: 'desc' },
      take: limit,
      include: {
        buyOrder: { select: { userId: true } },
        sellOrder: { select: { userId: true } },
      },
    });
  }

  
  public async getVolumeStats(since: Date): Promise<{
    totalTrades: number;
    totalVolume: number;
    totalValue: number;
  }> {
    const trades = await this.prisma.trade.findMany({
      where: { executedAt: { gte: since } },
    });

    return {
      totalTrades: trades.length,
      totalVolume: trades.reduce(
        (sum, t) => sum + Number(t.quantity),
        0
      ),
      totalValue: trades.reduce(
        (sum, t) => sum + Number(t.price) * Number(t.quantity),
        0
      ),
    };
  }

  
  public async getPriceHistory(
    limit: number = 100
  ): Promise<Array<{ price: number; quantity: number; executedAt: Date }>> {
    const trades = await this.prisma.trade.findMany({
      orderBy: { executedAt: 'asc' },
      take: limit,
      select: { price: true, quantity: true, executedAt: true },
    });

    return trades.map((t) => ({
      price: Number(t.price),
      quantity: Number(t.quantity),
      executedAt: t.executedAt,
    }));
  }
}
