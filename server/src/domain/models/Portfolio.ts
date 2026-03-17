

import { v4 as uuidv4 } from 'uuid';

export class Portfolio {
  private _id: string;
  private _userId: string;
  private _assetSymbol: string;
  private _quantity: number;
  private _averagePrice: number;
  private _updatedAt: Date;

  constructor(
    userId: string,
    assetSymbol: string,
    quantity: number = 0,
    averagePrice: number = 0,
    id?: string
  ) {
    this._id = id || uuidv4();
    this._userId = userId;
    this._assetSymbol = assetSymbol;
    this._quantity = quantity;
    this._averagePrice = averagePrice;
    this._updatedAt = new Date();
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get assetSymbol(): string {
    return this._assetSymbol;
  }

  get quantity(): number {
    return this._quantity;
  }

  get averagePrice(): number {
    return this._averagePrice;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  
  get totalValue(): number {
    return this._quantity * this._averagePrice;
  }

  
  public addPosition(quantity: number, price: number): void {
    if (quantity <= 0 || price <= 0) {
      throw new Error('Quantity and price must be positive');
    }

    const totalCost =
      this._quantity * this._averagePrice + quantity * price;
    this._quantity += quantity;
    this._averagePrice = totalCost / this._quantity;
    this._updatedAt = new Date();
  }

  
  public removePosition(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    if (quantity > this._quantity) {
      throw new Error(
        `Insufficient position. Have: ${this._quantity}, Selling: ${quantity}`
      );
    }

    this._quantity -= quantity;
    if (this._quantity === 0) {
      this._averagePrice = 0;
    }
    this._updatedAt = new Date();
  }

  
  public getUnrealizedPnL(currentPrice: number): number {
    return (currentPrice - this._averagePrice) * this._quantity;
  }

  public toJSON(): Record<string, any> {
    return {
      id: this._id,
      userId: this._userId,
      assetSymbol: this._assetSymbol,
      quantity: this._quantity,
      averagePrice: this._averagePrice,
      totalValue: this.totalValue,
      updatedAt: this._updatedAt,
    };
  }
}
