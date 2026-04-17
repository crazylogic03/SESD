

import { PortfolioRepository } from '../repositories/PortfolioRepository';
import { Logger } from '../utils/logger';

export class PortfolioService {
  private portfolioRepository: PortfolioRepository;
  private logger: Logger;

  constructor() {
    this.portfolioRepository = new PortfolioRepository();
    this.logger = new Logger('PortfolioService');
  }

  
  public async updatePortfolio(
    buyerUserId: string,
    sellerUserId: string,
    assetSymbol: string,
    quantity: number,
    price: number
  ): Promise<void> {
    try {

      const buyerPosition =
        await this.portfolioRepository.findByUserAndAsset(
          buyerUserId,
          assetSymbol
        );

      if (buyerPosition) {

        const existingQty = Number(buyerPosition.quantity);
        const existingAvgPrice = Number(buyerPosition.averagePrice);
        const totalCost =
          existingQty * existingAvgPrice + quantity * price;
        const newQty = existingQty + quantity;
        const newAvgPrice = totalCost / newQty;

        await this.portfolioRepository.upsertPosition(
          buyerUserId,
          assetSymbol,
          newQty,
          newAvgPrice
        );
      } else {

        await this.portfolioRepository.upsertPosition(
          buyerUserId,
          assetSymbol,
          quantity,
          price
        );
      }

      const sellerPosition =
        await this.portfolioRepository.findByUserAndAsset(
          sellerUserId,
          assetSymbol
        );

      if (sellerPosition) {
        const newQty = Number(sellerPosition.quantity) - quantity;
        if (newQty <= 0) {
          await this.portfolioRepository.upsertPosition(
            sellerUserId,
            assetSymbol,
            0,
            0
          );
        } else {
          await this.portfolioRepository.upsertPosition(
            sellerUserId,
            assetSymbol,
            newQty,
            Number(sellerPosition.averagePrice)
          );
        }
      }

      this.logger.info(
        `Portfolio updated: buyer=${buyerUserId}, seller=${sellerUserId}, qty=${quantity} @ ${price}`
      );
    } catch (error: any) {
      this.logger.error('Portfolio update failed', error);
      throw error;
    }
  }

  
  public async getUserPortfolio(userId: string): Promise<any[]> {
    return this.portfolioRepository.findByUserId(userId);
  }

  
  public async getPosition(
    userId: string,
    assetSymbol: string
  ): Promise<any | null> {
    return this.portfolioRepository.findByUserAndAsset(userId, assetSymbol);
  }
}
