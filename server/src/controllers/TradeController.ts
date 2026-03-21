

import { Response } from 'express';
import { TradeService } from '../services/TradeService';
import { AuthRequest } from '../middleware/auth';

export class TradeController {
  private tradeService: TradeService;

  constructor() {
    this.tradeService = new TradeService();
  }

  
  public getTrades = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const trades = await this.tradeService.getUserTrades(userId);
      res.json({ trades });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  
  public getRecentTrades = async (
    _req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const limit = 20;
      const trades = await this.tradeService.getRecentTrades(limit);
      res.json({ trades });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  
  public getPriceHistory = async (
    _req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const history = await this.tradeService.getPriceHistory();
      res.json({ priceHistory: history });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
