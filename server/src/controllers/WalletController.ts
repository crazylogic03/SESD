

import { Response } from 'express';
import { WalletService } from '../services/WalletService';
import { AuthRequest } from '../middleware/auth';

export class WalletController {
  private walletService: WalletService;

  constructor() {
    this.walletService = new WalletService();
  }

  
  public getBalance = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const balance = await this.walletService.getBalance(userId);
      res.json(balance);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  
  public deposit = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { amount } = req.body;
      const result = await this.walletService.deposit(userId, amount);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  
  public withdraw = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { amount } = req.body;
      const result = await this.walletService.withdraw(userId, amount);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  
  public getTransactions = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const transactions = await this.walletService.getTransactions(userId);
      res.json({ transactions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
