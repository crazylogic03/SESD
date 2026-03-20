

import { OrderBook, OrderBookDepth } from './OrderBook';
import { RiskEngine, RiskValidationResult } from './RiskEngine';
import { PriceTimePriorityStrategy } from './strategies/PriceTimePriorityStrategy';
import { Order } from '../domain/models/Order';
import { Trade } from '../domain/models/Trade';
import { Wallet } from '../domain/models/Wallet';
import { Portfolio } from '../domain/models/Portfolio';
import {
  IMatchingStrategy,
} from '../domain/interfaces/IMatchingStrategy';
import {
  IOrderObserver,
  TradeEvent,
  OrderEvent,
} from '../domain/interfaces/IOrderObserver';

export interface MatchingResult {
  success: boolean;
  order: Order;
  trades: Trade[];
  errors: string[];
  riskValidation: RiskValidationResult;
}

export interface EngineMetrics {
  totalOrdersProcessed: number;
  totalTradesExecuted: number;
  ordersPerSecond: number;
  averageMatchLatencyMs: number;
  orderBookDepth: OrderBookDepth;
  uptime: number;
}

export class MatchingEngine {

  private static _instance: MatchingEngine | null = null;

  private _orderBook: OrderBook;
  private _riskEngine: RiskEngine;
  private _strategy: IMatchingStrategy;
  private _observers: IOrderObserver[];

  private _totalOrdersProcessed: number;
  private _totalTradesExecuted: number;
  private _matchLatencies: number[];
  private _startTime: Date;
  private _lastSecondOrders: number;
  private _lastSecondTimestamp: number;

  private constructor() {
    this._orderBook = new OrderBook();
    this._riskEngine = new RiskEngine();
    this._strategy = new PriceTimePriorityStrategy();
    this._observers = [];
    this._totalOrdersProcessed = 0;
    this._totalTradesExecuted = 0;
    this._matchLatencies = [];
    this._startTime = new Date();
    this._lastSecondOrders = 0;
    this._lastSecondTimestamp = Date.now();
  }

  
  public static getInstance(): MatchingEngine {
    if (!MatchingEngine._instance) {
      MatchingEngine._instance = new MatchingEngine();
    }
    return MatchingEngine._instance;
  }

  
  public static resetInstance(): void {
    MatchingEngine._instance = null;
  }

  
  public setStrategy(strategy: IMatchingStrategy): void {
    this._strategy = strategy;
  }

  
  public addObserver(observer: IOrderObserver): void {
    this._observers.push(observer);
  }

  
  public removeObserver(observer: IOrderObserver): void {
    this._observers = this._observers.filter((o) => o !== observer);
  }

  
  public processOrder(
    order: Order,
    wallet: Wallet,
    portfolio?: Portfolio
  ): MatchingResult {
    const startTime = performance.now();
    this._totalOrdersProcessed++;
    this.updateOPS();

    const riskValidation = this._riskEngine.validateOrder(
      order,
      wallet,
      portfolio
    );

    if (!riskValidation.isValid) {
      return {
        success: false,
        order,
        trades: [],
        errors: riskValidation.errors,
        riskValidation,
      };
    }

    this._orderBook.addOrder(order);

    this.notifyOrderStatus(order);

    const trades = this.match();

    const latency = performance.now() - startTime;
    this._matchLatencies.push(latency);
    if (this._matchLatencies.length > 1000) {
      this._matchLatencies.shift();
    }

    this.notifyOrderBookUpdate();

    return {
      success: true,
      order,
      trades,
      errors: [],
      riskValidation,
    };
  }

  
  public match(): Trade[] {
    const trades: Trade[] = [];

    while (true) {
      const topBuy = this._orderBook.getTopBuy();
      const topSell = this._orderBook.getTopSell();

      if (!topBuy || !topSell) break;

      if (!this._strategy.canMatch(topBuy, topSell)) break;

      const executionPrice = this._strategy.getExecutionPrice(
        topBuy,
        topSell
      );
      const matchQuantity = this._strategy.getMatchQuantity(
        topBuy,
        topSell
      );

      topBuy.fill(matchQuantity);
      topSell.fill(matchQuantity);

      const trade = new Trade(
        topBuy.id,
        topSell.id,
        executionPrice,
        matchQuantity
      );
      trades.push(trade);
      this._totalTradesExecuted++;

      if (topBuy.isFilled) {
        this._orderBook.popTopBuy();
      }
      if (topSell.isFilled) {
        this._orderBook.popTopSell();
      }

      this.notifyTradeExecuted(trade);
      this.notifyOrderStatus(topBuy);
      this.notifyOrderStatus(topSell);
    }

    return trades;
  }

  
  public cancelOrder(orderId: string): Order | undefined {
    const order = this._orderBook.removeOrder(orderId);
    if (order) {
      order.cancel();
      this.notifyOrderStatus(order);
      this.notifyOrderBookUpdate();
    }
    return order;
  }

  
  public getOrderBookDepth(levels?: number): OrderBookDepth {
    return this._orderBook.getDepth(levels);
  }

  
  public getOrderBook(): OrderBook {
    return this._orderBook;
  }

  
  public getMetrics(): EngineMetrics {
    const avgLatency =
      this._matchLatencies.length > 0
        ? this._matchLatencies.reduce((a, b) => a + b, 0) /
          this._matchLatencies.length
        : 0;

    return {
      totalOrdersProcessed: this._totalOrdersProcessed,
      totalTradesExecuted: this._totalTradesExecuted,
      ordersPerSecond: this._lastSecondOrders,
      averageMatchLatencyMs: Math.round(avgLatency * 100) / 100,
      orderBookDepth: this._orderBook.getDepth(),
      uptime: (Date.now() - this._startTime.getTime()) / 1000,
    };
  }

  private notifyTradeExecuted(trade: Trade): void {
    const event: TradeEvent = {
      tradeId: trade.id,
      buyOrderId: trade.buyOrderId,
      sellOrderId: trade.sellOrderId,
      price: trade.price,
      quantity: trade.quantity,
      executedAt: trade.executedAt,
    };
    this._observers.forEach((o) => o.onTradeExecuted(event));
  }

  private notifyOrderStatus(order: Order): void {
    const event: OrderEvent = {
      orderId: order.id,
      userId: order.userId,
      side: order.side,
      price: order.price,
      quantity: order.quantity,
      status: order.status,
    };
    this._observers.forEach((o) => o.onOrderStatusChanged(event));
  }

  private notifyOrderBookUpdate(): void {
    const depth = this._orderBook.getDepth();
    this._observers.forEach((o) =>
      o.onOrderBookUpdated({
        buyOrders: depth.bids,
        sellOrders: depth.asks,
        timestamp: new Date(),
      })
    );
  }

  private updateOPS(): void {
    const now = Date.now();
    if (now - this._lastSecondTimestamp >= 1000) {
      this._lastSecondOrders = 0;
      this._lastSecondTimestamp = now;
    }
    this._lastSecondOrders++;
  }
}
