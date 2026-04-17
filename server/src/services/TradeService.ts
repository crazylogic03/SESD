

import { Trade } from '../domain/models/Trade';
import { TradeRepository } from '../repositories/TradeRepository';
import { WalletRepository } from '../repositories/WalletRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { OrderRepository } from '../repositories/OrderRepository';
import { PortfolioService } from './PortfolioService';
import { Logger } from '../utils/logger';

export class TradeService {
  private tradeRepository: TradeRepository;
  private walletRepository: WalletRepository;
  private transactionRepository: TransactionRepository;
  private orderRepository: OrderRepository;
  private portfolioService: PortfolioService;
  private logger: Logger;

  constructor() {
    this.tradeRepository = new TradeRepository();
    this.walletRepository = new WalletRepository();
    this.transactionRepository = new TransactionRepository();
    this.orderRepository = new OrderRepository();
    this.portfolioService = new PortfolioService();
    this.logger = new Logger('TradeService');
  }

  
  public async recordTrade(trade: Trade): Promise<any> {
    try {

      const tradeRecord = await this.tradeRepository.create({
        id: trade.id,
        buyOrderId: trade.buyOrderId,
        sellOrderId: trade.sellOrderId,
        price: trade.price,
        quantity: trade.quantity,
        executedAt: trade.executedAt,
      });

      const buyOrder = await this.orderRepository.findById(trade.buyOrderId);
      const sellOrder = await this.orderRepository.findById(trade.sellOrderId);

      if (!buyOrder || !sellOrder) {
        this.logger.error('Orders not found for trade settlement', {
          tradeId: trade.id,
        });
        return tradeRecord;
      }

      const tradeValue = trade.price * trade.quantity;

      await this.walletRepository.releaseFunds(
        buyOrder.userId,
        Number(buyOrder.price) * trade.quantity
      );
      await this.walletRepository.decrementBalance(
        buyOrder.userId,
        tradeValue
      );

      await this.walletRepository.incrementBalance(
        sellOrder.userId,
        tradeValue
      );

      await this.transactionRepository.create({
        userId: buyOrder.userId,
        tradeId: trade.id,
        transactionType: 'TRADE_BUY' as any,
        amount: tradeValue,
      });

      await this.transactionRepository.create({
        userId: sellOrder.userId,
        tradeId: trade.id,
        transactionType: 'TRADE_SELL' as any,
        amount: tradeValue,
      });

      await this.portfolioService.updatePortfolio(
        buyOrder.userId,
        sellOrder.userId,
        'STOCK',
        trade.quantity,
        trade.price
      );

      await this.orderRepository.updateOrderFill(
        buyOrder.id,
        Number(buyOrder.filledQuantity) + trade.quantity,
        Number(buyOrder.filledQuantity) + trade.quantity >= Number(buyOrder.quantity)
          ? 'FILLED'
          : 'PARTIAL'
      );

      await this.orderRepository.updateOrderFill(
        sellOrder.id,
        Number(sellOrder.filledQuantity) + trade.quantity,
        Number(sellOrder.filledQuantity) + trade.quantity >= Number(sellOrder.quantity)
          ? 'FILLED'
          : 'PARTIAL'
      );

      this.logger.info(
        `Trade settled: ${trade.id} | ${trade.quantity} @ ${trade.price}`
      );

      return tradeRecord;
    } catch (error: any) {
      this.logger.error('Trade settlement failed', error);
      throw error;
    }
  }

  
  public async getUserTrades(userId: string): Promise<any[]> {
    return this.tradeRepository.findByUserId(userId);
  }

  
  public async getRecentTrades(limit: number = 20): Promise<any[]> {
    return this.tradeRepository.findRecent(limit);
  }

  
  public async getVolumeStats(hours: number = 24): Promise<any> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.tradeRepository.getVolumeStats(since);
  }

  
  public async getPriceHistory(limit: number = 100): Promise<any[]> {
    return this.tradeRepository.getPriceHistory(limit);
  }
}
