

import { WalletRepository } from '../repositories/WalletRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { Logger } from '../utils/logger';

export class WalletService {
  private walletRepository: WalletRepository;
  private transactionRepository: TransactionRepository;
  private logger: Logger;

  constructor() {
    this.walletRepository = new WalletRepository();
    this.transactionRepository = new TransactionRepository();
    this.logger = new Logger('WalletService');
  }

  
  public async getBalance(userId: string): Promise<any> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    return {
      balance: Number(wallet.balance),
      reservedBalance: Number(wallet.reservedBalance),
      availableBalance:
        Number(wallet.balance) - Number(wallet.reservedBalance),
    };
  }

  
  public async deposit(userId: string, amount: number): Promise<any> {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }

    const wallet = await this.walletRepository.incrementBalance(
      userId,
      amount
    );

    await this.transactionRepository.create({
      userId,
      transactionType: 'DEPOSIT' as any,
      amount,
    });

    this.logger.info(`Deposit: ${amount} for user ${userId}`);

    return {
      balance: Number(wallet.balance),
      reservedBalance: Number(wallet.reservedBalance),
      availableBalance:
        Number(wallet.balance) - Number(wallet.reservedBalance),
    };
  }

  
  public async withdraw(userId: string, amount: number): Promise<any> {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }

    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const available =
      Number(wallet.balance) - Number(wallet.reservedBalance);
    if (amount > available) {
      throw new Error(
        `Insufficient available balance. Available: ${available.toFixed(2)}`
      );
    }

    const updatedWallet = await this.walletRepository.decrementBalance(
      userId,
      amount
    );

    await this.transactionRepository.create({
      userId,
      transactionType: 'WITHDRAWAL' as any,
      amount,
    });

    this.logger.info(`Withdrawal: ${amount} for user ${userId}`);

    return {
      balance: Number(updatedWallet.balance),
      reservedBalance: Number(updatedWallet.reservedBalance),
      availableBalance:
        Number(updatedWallet.balance) -
        Number(updatedWallet.reservedBalance),
    };
  }

  
  public async getTransactions(userId: string): Promise<any[]> {
    return this.transactionRepository.findByUserId(userId);
  }
}
