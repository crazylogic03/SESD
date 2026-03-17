

import { Order } from './Order';
import { OrderSide } from '../enums/OrderSide';
import { OrderType } from '../enums/OrderType';
import { OrderStatus } from '../enums/OrderStatus';

export class BuyOrder extends Order {
  constructor(
    userId: string,
    orderType: OrderType,
    price: number,
    quantity: number,
    id?: string,
    filledQuantity?: number,
    status?: OrderStatus,
    createdAt?: Date
  ) {
    super(
      userId,
      orderType,
      OrderSide.BUY,
      price,
      quantity,
      id,
      filledQuantity,
      status,
      createdAt
    );
  }

  
  public execute(): void {
    if (!this.isActive) {
      throw new Error(`Buy order ${this.id} is not in an executable state`);
    }

  }

  
  public getTotalCost(): number {
    return this._price * this.remainingQuantity;
  }

  public toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      totalCost: this.getTotalCost(),
    };
  }
}
