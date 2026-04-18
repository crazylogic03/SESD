

import { MatchingEngine } from '../engine/MatchingEngine';
import { TradeRepository } from '../repositories/TradeRepository';
import { OrderRepository } from '../repositories/OrderRepository';
import { UserRepository } from '../repositories/UserRepository';
import { Logger } from '../utils/logger';

export class AnalyticsService {
  private matchingEngine: MatchingEngine;
  private tradeRepository: TradeRepository;
  private orderRepository: OrderRepository;
  private userRepository: UserRepository;
  private logger: Logger;

  constructor() {
    this.matchingEngine = MatchingEngine.getInstance();
    this.tradeRepository = new TradeRepository();
    this.orderRepository = new OrderRepository();
    this.userRepository = new UserRepository();
    this.logger = new Logger('AnalyticsService');
  }

  
  public async getSystemMetrics(): Promise<any> {
    const engineMetrics = this.matchingEngine.getMetrics();
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [volumeStats, totalUsers, totalOrders] = await Promise.all([
      this.tradeRepository.getVolumeStats(last24h),
      this.userRepository.count(),
      this.orderRepository.count(),
    ]);

    return {
      engine: {
        totalOrdersProcessed: engineMetrics.totalOrdersProcessed,
        totalTradesExecuted: engineMetrics.totalTradesExecuted,
        ordersPerSecond: engineMetrics.ordersPerSecond,
        averageMatchLatencyMs: engineMetrics.averageMatchLatencyMs,
        uptime: engineMetrics.uptime,
      },
      volume: {
        last24h: volumeStats,
      },
      system: {
        totalUsers,
        totalOrders,
        orderBookDepth: engineMetrics.orderBookDepth,
      },
    };
  }

  
  public async getPriceHistory(limit: number = 100): Promise<any[]> {
    return this.tradeRepository.getPriceHistory(limit);
  }

  
  public async getOrderBookDepth(levels: number = 20): Promise<any> {
    return this.matchingEngine.getOrderBookDepth(levels);
  }
}
