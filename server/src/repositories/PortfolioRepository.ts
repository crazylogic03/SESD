

import { BaseRepository } from './base/BaseRepository';
import { Portfolio as PrismaPortfolio } from '@prisma/client';

export class PortfolioRepository extends BaseRepository<PrismaPortfolio> {
  protected modelName = 'portfolio';

  
  public async findByUserId(userId: string): Promise<PrismaPortfolio[]> {
    return this.prisma.portfolio.findMany({
      where: { userId },
      orderBy: { assetSymbol: 'asc' },
    });
  }

  
  public async findByUserAndAsset(
    userId: string,
    assetSymbol: string
  ): Promise<PrismaPortfolio | null> {
    return this.prisma.portfolio.findUnique({
      where: { userId_assetSymbol: { userId, assetSymbol } },
    });
  }

  
  public async upsertPosition(
    userId: string,
    assetSymbol: string,
    quantity: number,
    averagePrice: number
  ): Promise<PrismaPortfolio> {
    return this.prisma.portfolio.upsert({
      where: { userId_assetSymbol: { userId, assetSymbol } },
      create: {
        userId,
        assetSymbol,
        quantity,
        averagePrice,
      },
      update: {
        quantity,
        averagePrice,
      },
    });
  }
}
