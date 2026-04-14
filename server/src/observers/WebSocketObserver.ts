

import { Server as SocketServer } from 'socket.io';
import {
  IOrderObserver,
  TradeEvent,
  OrderEvent,
  OrderBookUpdate,
} from '../domain/interfaces/IOrderObserver';

export class WebSocketObserver implements IOrderObserver {
  private _io: SocketServer;

  constructor(io: SocketServer) {
    this._io = io;
  }

  
  public onTradeExecuted(event: TradeEvent): void {
    this._io.emit('trade:executed', event);
  }

  
  public onOrderStatusChanged(event: OrderEvent): void {

    this._io.emit('order:status', {
      orderId: event.orderId,
      status: event.status,
      side: event.side,
      price: event.price,
      quantity: event.quantity,
    });

    this._io.to(`user:${event.userId}`).emit('order:personal', event);
  }

  
  public onOrderBookUpdated(update: OrderBookUpdate): void {
    this._io.emit('orderbook:update', update);
  }
}
