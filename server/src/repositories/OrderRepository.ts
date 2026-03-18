

import { BaseRepository } from './base/BaseRepository';
import { Order as PrismaOrder } from '@prisma/client';

export class OrderRepository extends BaseRepository<PrismaOrder> {
  protected modelName = 'order';

  
  public async findByUserId(userId: string): Promise<PrismaOrder[]> {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  
  public async findActiveByUserId(userId: string): Promise<PrismaOrder[]> {
    return this.prisma.order.findMany({
      where: {
        userId,
        status: { in: ['PENDING', 'PARTIAL'] },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  
  public async findAllActive(): Promise<PrismaOrder[]> {
    return this.prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'PARTIAL'] },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  
  public async updateOrderFill(
    id: string,
    filledQuantity: number,
    status: string
  ): Promise<PrismaOrder> {
    return this.prisma.order.update({
      where: { id },
      data: {
        filledQuantity,
        status: status as any,
      },
    });
  }

  
  public async getUserOrderStats(userId: string): Promise<{
    totalOrders: number;
    activeOrders: number;
    filledOrders: number;
    cancelledOrders: number;
  }> {
    const [totalOrders, activeOrders, filledOrders, cancelledOrders] =
      await Promise.all([
        this.prisma.order.count({ where: { userId } }),
        this.prisma.order.count({
          where: { userId, status: { in: ['PENDING', 'PARTIAL'] } },
        }),
        this.prisma.order.count({
          where: { userId, status: 'FILLED' },
        }),
        this.prisma.order.count({
          where: { userId, status: 'CANCELLED' },
        }),
      ]);

    return { totalOrders, activeOrders, filledOrders, cancelledOrders };
  }

  
  public async findRecent(limit: number = 50): Promise<PrismaOrder[]> {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { username: true } } },
    });
  }
}
