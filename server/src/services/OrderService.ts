

import { MatchingEngine } from '../engine/MatchingEngine';
import { OrderFactory, CreateOrderParams } from '../factories/OrderFactory';
import { OrderRepository } from '../repositories/OrderRepository';
import { WalletRepository } from '../repositories/WalletRepository';
import { PortfolioRepository } from '../repositories/PortfolioRepository';
import { TradeService } from './TradeService';
import { OrderSide } from '../domain/enums/OrderSide';
import { OrderType } from '../domain/enums/OrderType';
import { Wallet } from '../domain/models/Wallet';
import { Portfolio } from '../domain/models/Portfolio';
import { Logger } from '../utils/logger';

export interface PlaceOrderRequest {
  userId: string;
  orderType: string;
  side: string;
  price: number;
  quantity: number;
}

export interface OrderResponse {
  success: boolean;
  order: any;
  trades: any[];
  errors: string[];
}

export class OrderService {
  private matchingEngine: MatchingEngine;
  private orderRepository: OrderRepository;
  private walletRepository: WalletRepository;
  private portfolioRepository: PortfolioRepository;
  private tradeService: TradeService;
  private logger: Logger;

  constructor() {
    this.matchingEngine = MatchingEngine.getInstance();
    this.orderRepository = new OrderRepository();
    this.walletRepository = new WalletRepository();
    this.portfolioRepository = new PortfolioRepository();
    this.tradeService = new TradeService();
    this.logger = new Logger('OrderService');
  }

  
  public async createOrder(request: PlaceOrderRequest): Promise<OrderResponse> {
    const { userId, orderType, side, price, quantity } = request;

    try {

      const order = OrderFactory.createOrder({
        userId,
        orderType: orderType as OrderType,
        side: side as OrderSide,
        price,
        quantity,
      });

      const walletRecord = await this.walletRepository.findByUserId(userId);
      if (!walletRecord) {
        return {
          success: false,
          order: null,
          trades: [],
          errors: ['Wallet not found for user'],
        };
      }

      const wallet = new Wallet(
        walletRecord.userId,
        Number(walletRecord.balance),
        Number(walletRecord.reservedBalance),
        walletRecord.id
      );

      let portfolio: Portfolio | undefined;
      if (side === OrderSide.SELL) {
        const portfolioRecord =
          await this.portfolioRepository.findByUserAndAsset(userId, 'STOCK');
        if (portfolioRecord) {
          portfolio = new Portfolio(
            portfolioRecord.userId,
            portfolioRecord.assetSymbol,
            Number(portfolioRecord.quantity),
            Number(portfolioRecord.averagePrice),
            portfolioRecord.id
          );
        }
      }

      const result = this.matchingEngine.processOrder(order, wallet, portfolio);

      if (!result.success) {
        return {
          success: false,
          order: order.toJSON(),
          trades: [],
          errors: result.errors,
        };
      }

      await this.orderRepository.create({
        id: order.id,
        userId: order.userId,
        orderType: order.orderType as any,
        side: order.side as any,
        price: order.price,
        quantity: order.quantity,
        filledQuantity: order.filledQuantity,
        status: order.status as any,
      });

      if (side === OrderSide.BUY && result.riskValidation.requiredReservation > 0) {
        const reservationAmount =
          result.riskValidation.requiredReservation -
          result.trades.reduce((sum, t) => sum + t.price * t.quantity, 0);
        if (reservationAmount > 0) {
          await this.walletRepository.reserveFunds(userId, reservationAmount);
        }
      }

      const processedTrades = [];
      for (const trade of result.trades) {
        const processed = await this.tradeService.recordTrade(trade);
        processedTrades.push(processed);
      }

      if (order.filledQuantity > 0) {
        await this.orderRepository.updateOrderFill(
          order.id,
          order.filledQuantity,
          order.status
        );
      }

      this.logger.info(
        `Order placed: ${side} ${quantity} @ ${price} → ${result.trades.length} trades`
      );

      return {
        success: true,
        order: order.toJSON(),
        trades: processedTrades,
        errors: [],
      };
    } catch (error: any) {
      this.logger.error('Failed to create order', error);
      return {
        success: false,
        order: null,
        trades: [],
        errors: [error.message],
      };
    }
  }

  
  public async cancelOrder(
    orderId: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {

      const orderRecord = await this.orderRepository.findById(orderId);
      if (!orderRecord) {
        return { success: false, message: 'Order not found' };
      }
      if (orderRecord.userId !== userId) {
        return { success: false, message: 'Unauthorized: not your order' };
      }
      if (orderRecord.status === 'FILLED' || orderRecord.status === 'CANCELLED') {
        return {
          success: false,
          message: `Cannot cancel order: already ${orderRecord.status}`,
        };
      }

      this.matchingEngine.cancelOrder(orderId);

      await this.orderRepository.update(orderId, {
        status: 'CANCELLED' as any,
      });

      if (orderRecord.side === 'BUY') {
        const remainingQty =
          Number(orderRecord.quantity) - Number(orderRecord.filledQuantity);
        const reservedAmount = Number(orderRecord.price) * remainingQty;
        if (reservedAmount > 0) {
          await this.walletRepository.releaseFunds(userId, reservedAmount);
        }
      }

      this.logger.info(`Order cancelled: ${orderId}`);
      return { success: true, message: 'Order cancelled successfully' };
    } catch (error: any) {
      this.logger.error('Failed to cancel order', error);
      return { success: false, message: error.message };
    }
  }

  
  public async getUserOrders(userId: string): Promise<any[]> {
    return this.orderRepository.findByUserId(userId);
  }

  
  public async getActiveOrders(userId: string): Promise<any[]> {
    return this.orderRepository.findActiveByUserId(userId);
  }

  
  public async getOrderBook(): Promise<any> {
    return this.matchingEngine.getOrderBookDepth(20);
  }
}
