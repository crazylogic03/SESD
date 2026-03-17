

export interface TradeEvent {
  tradeId: string;
  buyOrderId: string;
  sellOrderId: string;
  price: number;
  quantity: number;
  executedAt: Date;
}

export interface OrderEvent {
  orderId: string;
  userId: string;
  side: string;
  price: number;
  quantity: number;
  status: string;
}

export interface OrderBookUpdate {
  buyOrders: Array<{ price: number; quantity: number }>;
  sellOrders: Array<{ price: number; quantity: number }>;
  timestamp: Date;
}

export interface IOrderObserver {
  
  onTradeExecuted(event: TradeEvent): void;

  
  onOrderStatusChanged(event: OrderEvent): void;

  
  onOrderBookUpdated(update: OrderBookUpdate): void;
}
