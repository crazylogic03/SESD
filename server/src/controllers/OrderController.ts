

import { Response } from 'express';
import { OrderService } from '../services/OrderService';
import { AuthRequest } from '../middleware/auth';
import { Logger } from '../utils/logger';

export class OrderController {
  private orderService: OrderService;
  private logger: Logger;

  constructor() {
    this.orderService = new OrderService();
    this.logger = new Logger('OrderController');
  }

  
  public placeOrder = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { orderType, side, price, quantity } = req.body;
      const userId = req.user!.userId;

      const result = await this.orderService.createOrder({
        userId,
        orderType,
        side,
        price,
        quantity,
      });

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      this.logger.error('Order placement failed', error);
      res.status(500).json({ error: error.message });
    }
  };

  
  public cancelOrder = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const result = await this.orderService.cancelOrder(id, userId);
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      this.logger.error('Order cancellation failed', error);
      res.status(500).json({ error: error.message });
    }
  };

  
  public getOrders = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const orders = await this.orderService.getUserOrders(userId);
      res.json({ orders });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  
  public getActiveOrders = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const orders = await this.orderService.getActiveOrders(userId);
      res.json({ orders });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  
  public getOrderBook = async (
    _req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const orderBook = await this.orderService.getOrderBook();
      res.json({ orderBook });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
