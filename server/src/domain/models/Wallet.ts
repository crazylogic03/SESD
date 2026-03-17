

import { v4 as uuidv4 } from 'uuid';

export class Wallet {
  private _id: string;
  private _userId: string;
  private _balance: number;
  private _reservedBalance: number;
  private _updatedAt: Date;

  constructor(
    userId: string,
    balance: number = 0,
    reservedBalance: number = 0,
    id?: string
  ) {
    this._id = id || uuidv4();
    this._userId = userId;
    this._balance = balance;
    this._reservedBalance = reservedBalance;
    this._updatedAt = new Date();
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get balance(): number {
    return this._balance;
  }

  get reservedBalance(): number {
    return this._reservedBalance;
  }

  
  get availableBalance(): number {
    return this._balance - this._reservedBalance;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  
  public credit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Credit amount must be positive');
    }
    this._balance += amount;
    this._updatedAt = new Date();
  }

  
  public debit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Debit amount must be positive');
    }
    if (amount > this.availableBalance) {
      throw new Error(
        `Insufficient balance. Available: ${this.availableBalance}, Requested: ${amount}`
      );
    }
    this._balance -= amount;
    this._updatedAt = new Date();
  }

  
  public reserve(amount: number): void {
    if (amount <= 0) {
      throw new Error('Reserve amount must be positive');
    }
    if (amount > this.availableBalance) {
      throw new Error(
        `Insufficient available balance to reserve. Available: ${this.availableBalance}, Requested: ${amount}`
      );
    }
    this._reservedBalance += amount;
    this._updatedAt = new Date();
  }

  
  public release(amount: number): void {
    if (amount <= 0) {
      throw new Error('Release amount must be positive');
    }
    if (amount > this._reservedBalance) {
      throw new Error(
        `Cannot release more than reserved. Reserved: ${this._reservedBalance}, Requested: ${amount}`
      );
    }
    this._reservedBalance -= amount;
    this._updatedAt = new Date();
  }

  
  public executeTradeDebit(
    reservedAmount: number,
    actualAmount: number
  ): void {
    this.release(reservedAmount);
    this._balance -= actualAmount;
    this._updatedAt = new Date();
  }

  
  public hasSufficientBalance(amount: number): boolean {
    return this.availableBalance >= amount;
  }

  public toJSON(): Record<string, any> {
    return {
      id: this._id,
      userId: this._userId,
      balance: this._balance,
      reservedBalance: this._reservedBalance,
      availableBalance: this.availableBalance,
      updatedAt: this._updatedAt,
    };
  }
}
