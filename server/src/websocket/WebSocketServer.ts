

import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { MatchingEngine } from '../engine/MatchingEngine';
import { WebSocketObserver } from '../observers/WebSocketObserver';
import { Logger } from '../utils/logger';

export class WebSocketServerSetup {
  private io: SocketServer;
  private logger: Logger;

  constructor(httpServer: HttpServer) {
    this.logger = new Logger('WebSocket');

    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.setupObserver();
    this.setupConnectionHandlers();
  }

  
  private setupObserver(): void {
    const observer = new WebSocketObserver(this.io);
    const engine = MatchingEngine.getInstance();
    engine.addObserver(observer);
    this.logger.info('WebSocket observer registered with MatchingEngine');
  }

  
  private setupConnectionHandlers(): void {
    this.io.on('connection', (socket) => {
      this.logger.info(`Client connected: ${socket.id}`);

      socket.on('join:user', (userId: string) => {
        socket.join(`user:${userId}`);
        this.logger.info(`${socket.id} joined room user:${userId}`);
      });

      socket.on('request:orderbook', () => {
        const engine = MatchingEngine.getInstance();
        const depth = engine.getOrderBookDepth(20);
        socket.emit('orderbook:update', {
          buyOrders: depth.bids,
          sellOrders: depth.asks,
          timestamp: new Date(),
        });
      });

      socket.on('disconnect', () => {
        this.logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  
  public getIO(): SocketServer {
    return this.io;
  }
}
