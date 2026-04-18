

import { Order } from '../domain/models/Order';
import { BuyOrder } from '../domain/models/BuyOrder';
import { SellOrder } from '../domain/models/SellOrder';
import { OrderSide } from '../domain/enums/OrderSide';
import { OrderType } from '../domain/enums/OrderType';
import { OrderStatus } from '../domain/enums/OrderStatus';

export interface CreateOrderParams {
  userId: string;
  orderType: OrderType;
  side: OrderSide;
  price: number;
  quantity: number;
  id?: string;
  filledQuantity?: number;
  status?: OrderStatus;
  createdAt?: Date;
}

export class OrderFactory {
  
  public static createOrder(params: CreateOrderParams): Order {
    const {
      userId,
      orderType,
      side,
      price,
      quantity,
      id,
      filledQuantity,
      status,
      createdAt,
    } = params;

    switch (side) {
      case OrderSide.BUY:
        return new BuyOrder(
          userId,
          orderType,
          price,
          quantity,
          id,
          filledQuantity,
          status,
          createdAt
        );

      case OrderSide.SELL:
        return new SellOrder(
          userId,
          orderType,
          price,
          quantity,
          id,
          filledQuantity,
          status,
          createdAt
        );

      default:
        throw new Error(`Unknown order side: ${side}`);
    }
  }

  
  public static fromRecord(record: {
    id: string;
    userId: string;
    orderType: string;
    side: string;
    price: number;
    quantity: number;
    filledQuantity: number;
    status: string;
    createdAt: Date;
  }): Order {
    return OrderFactory.createOrder({
      id: record.id,
      userId: record.userId,
      orderType: record.orderType as OrderType,
      side: record.side as OrderSide,
      price: record.price,
      quantity: record.quantity,
      filledQuantity: record.filledQuantity,
      status: record.status as OrderStatus,
      createdAt: record.createdAt,
    });
  }
}
