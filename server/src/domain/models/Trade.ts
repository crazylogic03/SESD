

import { v4 as uuidv4 } from 'uuid';

export class Trade {
  private readonly _id: string;
  private readonly _buyOrderId: string;
  private readonly _sellOrderId: string;
  private readonly _price: number;
  private readonly _quantity: number;
  private readonly _executedAt: Date;

  constructor(
    buyOrderId: string,
    sellOrderId: string,
    price: number,
    quantity: number,
    id?: string,
    executedAt?: Date
  ) {
    this._id = id || uuidv4();
    this._buyOrderId = buyOrderId;
    this._sellOrderId = sellOrderId;
    this._price = price;
    this._quantity = quantity;
    this._executedAt = executedAt || new Date();

    this.validate();
  }

  get id(): string {
    return this._id;
  }

  get buyOrderId(): string {
    return this._buyOrderId;
  }

  get sellOrderId(): string {
    return this._sellOrderId;
  }

  get price(): number {
    return this._price;
  }

  get quantity(): number {
    return this._quantity;
  }

  get executedAt(): Date {
    return this._executedAt;
  }

  
  get totalValue(): number {
    return this._price * this._quantity;
  }

  private validate(): void {
    if (this._price <= 0) {
      throw new Error('Trade price must be positive');
    }
    if (this._quantity <= 0) {
      throw new Error('Trade quantity must be positive');
    }
    if (this._buyOrderId === this._sellOrderId) {
      throw new Error('Buy and sell orders cannot be the same');
    }
  }

  public toJSON(): Record<string, any> {
    return {
      id: this._id,
      buyOrderId: this._buyOrderId,
      sellOrderId: this._sellOrderId,
      price: this._price,
      quantity: this._quantity,
      totalValue: this.totalValue,
      executedAt: this._executedAt,
    };
  }
}
