import { OrderService } from './OrderService';
import { UserRepository } from '../repositories/UserRepository';
import { WalletRepository } from '../repositories/WalletRepository';
import { PortfolioRepository } from '../repositories/PortfolioRepository';
import { Logger } from '../utils/logger';
import { OrderType } from '../domain/enums/OrderType';
import { OrderSide } from '../domain/enums/OrderSide';

export class MarketSimulator {
  private orderService: OrderService;
  private userRepository: UserRepository;
  private walletRepository: WalletRepository;
  private portfolioRepository: PortfolioRepository;
  private logger: Logger;
  private marketMakerId: string | null = null;
  
  private isRunning: boolean = false;
  private currentSpotPrice: number = 150.0;
  private volatility: number = 0.5; 

  constructor() {
    this.orderService = new OrderService();
    this.userRepository = new UserRepository();
    this.walletRepository = new WalletRepository();
    this.portfolioRepository = new PortfolioRepository();
    this.logger = new Logger('MarketSimulator');
  }

  public async initialize(): Promise<void> {
    try {
      let mm = await this.userRepository.findByUsername('MARKET_MAKER_BOT');
      
      if (!mm) {
        mm = await this.userRepository.create({
          username: 'MARKET_MAKER_BOT',
          email: 'bot@tradecore.local',
          passwordHash: 'simulation_only_no_auth',
          role: 'ADMIN' as any,
        });

        await this.walletRepository.create({
          userId: mm.id,
          balance: 1000000000, 
        });
        
        this.logger.info('Created MARKET_MAKER_BOT');
      }

      // Always assert infinite liquidity
      await this.portfolioRepository.upsertPosition(
        mm.id,
        'STOCK',
        1000000000,
        150
      );
      this.logger.info('Asserted infinite liquidity for MARKET_MAKER_BOT');

      this.marketMakerId = mm.id;
    } catch (error) {
      this.logger.error('Failed to initialize MarketSimulator', error);
    }
  }

  public startSimulation(): void {
    if (!this.marketMakerId) {
      this.logger.error('Cannot start simulation: Bot ID missing');
      return;
    }
    
    if (this.isRunning) return;
    this.isRunning = true;

    setInterval(async () => {
      this.injectLiquidity();
    }, 2000); 

    this.logger.info('Market simulator started');
  }

  public stopSimulation(): void {
    this.isRunning = false;
    this.logger.info('Market simulator stopped');
  }

  private async injectLiquidity(): Promise<void> {
    if (!this.isRunning || !this.marketMakerId) return;

    this.currentSpotPrice += (Math.random() * this.volatility * 2) - this.volatility;
    this.currentSpotPrice = Math.max(10, Math.round(this.currentSpotPrice * 100) / 100);

    const levelsCount = Math.floor(Math.random() * 3) + 2; 

    for (let i = 0; i < levelsCount; i++) {
      const bidPrice = Math.max(1, this.currentSpotPrice - (Math.random() * 2));
      const askPrice = this.currentSpotPrice + (Math.random() * 2);
      
      const bidQty = Math.floor(Math.random() * 10) + 1;
      const askQty = Math.floor(Math.random() * 10) + 1;

      try {
        await this.orderService.createOrder({
          userId: this.marketMakerId,
          orderType: 'LIMIT',
          side: 'BUY',
          price: Math.round(bidPrice * 100) / 100,
          quantity: bidQty,
        });
      } catch (err) { }

      try {
        await this.orderService.createOrder({
          userId: this.marketMakerId,
          orderType: 'LIMIT',
          side: 'SELL',
          price: Math.round(askPrice * 100) / 100,
          quantity: askQty,
        });
      } catch (err) { }
    }
  }
}
