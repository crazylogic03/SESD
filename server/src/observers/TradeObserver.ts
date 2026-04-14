

import {
  IOrderObserver,
  TradeEvent,
  OrderEvent,
  OrderBookUpdate,
} from '../domain/interfaces/IOrderObserver';

export class TradeObserver implements IOrderObserver {
  private _tradeLog: TradeEvent[] = [];

  public onTradeExecuted(event: TradeEvent): void {
    this._tradeLog.push(event);
    console.log(
      `[TRADE] ${event.tradeId}: ${event.quantity} @ ${event.price} | Buy: ${event.buyOrderId} | Sell: ${event.sellOrderId}`
    );
  }

  public onOrderStatusChanged(event: OrderEvent): void {
    console.log(
      `[ORDER] ${event.orderId}: ${event.side} ${event.quantity} @ ${event.price} → ${event.status}`
    );
  }

  public onOrderBookUpdated(update: OrderBookUpdate): void {
    console.log(
      `[BOOK] Bids: ${update.buyOrders.length} levels | Asks: ${update.sellOrders.length} levels`
    );
  }

  
  public getTradeLog(): TradeEvent[] {
    return [...this._tradeLog];
  }

  
  public getRecentTrades(count: number = 10): TradeEvent[] {
    return this._tradeLog.slice(-count);
  }
}
