

import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { AuthRequest } from '../middleware/auth';
import { Logger } from '../utils/logger';

export class AuthController {
  private authService: AuthService;
  private logger: Logger;

  constructor() {
    this.authService = new AuthService();
    this.logger = new Logger('AuthController');
  }

  
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, email, password, role } = req.body;
      const result = await this.authService.register(
        username,
        email,
        password,
        role
      );
      res.status(201).json(result);
    } catch (error: any) {
      this.logger.error('Registration failed', error);
      res.status(400).json({ error: error.message });
    }
  };

  
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;
      const result = await this.authService.login(username, password);
      res.json(result);
    } catch (error: any) {
      this.logger.error('Login failed', error);
      res.status(401).json({ error: error.message });
    }
  };

  
  public getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      res.json({ user: req.user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
