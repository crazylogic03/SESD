

import { Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { TradeService } from '../services/TradeService';
import { UserRepository } from '../repositories/UserRepository';
import { AuthRequest } from '../middleware/auth';

export class AdminController {
  private analyticsService: AnalyticsService;
  private tradeService: TradeService;
  private userRepository: UserRepository;

  constructor() {
    this.analyticsService = new AnalyticsService();
    this.tradeService = new TradeService();
    this.userRepository = new UserRepository();
  }

  
  public getMetrics = async (
    _req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const metrics = await this.analyticsService.getSystemMetrics();
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  
  public getAllTrades = async (
    _req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const trades = await this.tradeService.getRecentTrades(100);
      res.json({ trades });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  
  public getUsers = async (
    _req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const users = await this.userRepository.findAll();

      const sanitized = users.map((u: any) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      }));
      res.json({ users: sanitized });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  
  public getPriceHistory = async (
    _req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const history = await this.analyticsService.getPriceHistory();
      res.json({ priceHistory: history });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
