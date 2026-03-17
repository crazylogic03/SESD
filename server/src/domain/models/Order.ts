

import { v4 as uuidv4 } from 'uuid';
import { OrderSide } from '../enums/OrderSide';
import { OrderType } from '../enums/OrderType';
import { OrderStatus } from '../enums/OrderStatus';

export abstract class Order {

  protected _id: string;
  protected _userId: string;
  protected _orderType: OrderType;
  protected _side: OrderSide;
  protected _price: number;
  protected _quantity: number;
  protected _filledQuantity: number;
  protected _status: OrderStatus;
  protected _createdAt: Date;
  protected _updatedAt: Date;

  constructor(
    userId: string,
    orderType: OrderType,
    side: OrderSide,
    price: number,
    quantity: number,
    id?: string,
    filledQuantity?: number,
    status?: OrderStatus,
    createdAt?: Date
  ) {
    this._id = id || uuidv4();
    this._userId = userId;
    this._orderType = orderType;
    this._side = side;
    this._price = price;
    this._quantity = quantity;
    this._filledQuantity = filledQuantity || 0;
    this._status = status || OrderStatus.PENDING;
    this._createdAt = createdAt || new Date();
    this._updatedAt = new Date();

    this.validate();
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get orderType(): OrderType {
    return this._orderType;
  }

  get side(): OrderSide {
    return this._side;
  }

  get price(): number {
    return this._price;
  }

  get quantity(): number {
    return this._quantity;
  }

  get filledQuantity(): number {
    return this._filledQuantity;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  
  get remainingQuantity(): number {
    return this._quantity - this._filledQuantity;
  }

  
  get isFilled(): boolean {
    return this._filledQuantity >= this._quantity;
  }

  
  get isActive(): boolean {
    return (
      this._status === OrderStatus.PENDING ||
      this._status === OrderStatus.PARTIAL
    );
  }

  
  public fill(quantity: number): void {
    if (!this.isActive) {
      throw new Error(
        `Cannot fill order ${this._id}: order is ${this._status}`
      );
    }

    if (quantity <= 0) {
      throw new Error('Fill quantity must be positive');
    }

    if (quantity > this.remainingQuantity) {
      throw new Error(
        `Fill quantity ${quantity} exceeds remaining ${this.remainingQuantity}`
      );
    }

    this._filledQuantity += quantity;
    this._updatedAt = new Date();

    if (this.isFilled) {
      this._status = OrderStatus.FILLED;
    } else {
      this._status = OrderStatus.PARTIAL;
    }
  }

  
  public cancel(): void {
    if (
      this._status === OrderStatus.FILLED ||
      this._status === OrderStatus.CANCELLED
    ) {
      throw new Error(
        `Cannot cancel order ${this._id}: order is already ${this._status}`
      );
    }

    this._status = OrderStatus.CANCELLED;
    this._updatedAt = new Date();
  }

  
  public abstract execute(): void;

  
  protected validate(): void {
    if (this._price < 0) {
      throw new Error('Order price cannot be negative');
    }
    if (this._quantity <= 0) {
      throw new Error('Order quantity must be positive');
    }
    if (this._orderType === OrderType.LIMIT && this._price <= 0) {
      throw new Error('Limit order must have a positive price');
    }
  }

  
  public toJSON(): Record<string, any> {
    return {
      id: this._id,
      userId: this._userId,
      orderType: this._orderType,
      side: this._side,
      price: this._price,
      quantity: this._quantity,
      filledQuantity: this._filledQuantity,
      remainingQuantity: this.remainingQuantity,
      status: this._status,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
