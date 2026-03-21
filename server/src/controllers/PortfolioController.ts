

import { Response } from 'express';
import { PortfolioService } from '../services/PortfolioService';
import { AuthRequest } from '../middleware/auth';

export class PortfolioController {
  private portfolioService: PortfolioService;

  constructor() {
    this.portfolioService = new PortfolioService();
  }

  
  public getPortfolio = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const positions = await this.portfolioService.getUserPortfolio(userId);
      res.json({ positions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
