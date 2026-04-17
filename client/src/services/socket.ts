

import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  public connect(): Socket {
    if (this.socket?.connected) return this.socket;

    this.socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('[WS] Connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('[WS] Disconnected');
    });

    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public joinUserRoom(userId: string): void {
    this.socket?.emit('join:user', userId);
  }

  public requestOrderBook(): void {
    this.socket?.emit('request:orderbook');
  }

  public onTradeExecuted(callback: (data: any) => void): void {
    this.socket?.on('trade:executed', callback);
  }

  public onOrderBookUpdate(callback: (data: any) => void): void {
    this.socket?.on('orderbook:update', callback);
  }

  public onOrderStatus(callback: (data: any) => void): void {
    this.socket?.on('order:status', callback);
  }

  public onPersonalOrder(callback: (data: any) => void): void {
    this.socket?.on('order:personal', callback);
  }

  public disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();
