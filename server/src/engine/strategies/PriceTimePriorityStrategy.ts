

import { IMatchingStrategy } from '../../domain/interfaces/IMatchingStrategy';
import { Order } from '../../domain/models/Order';
import { OrderType } from '../../domain/enums/OrderType';

export class PriceTimePriorityStrategy implements IMatchingStrategy {
  
  public canMatch(buyOrder: Order, sellOrder: Order): boolean {

    if (
      buyOrder.orderType === OrderType.MARKET ||
      sellOrder.orderType === OrderType.MARKET
    ) {
      return true;
    }

    return buyOrder.price >= sellOrder.price;
  }

  
  public getExecutionPrice(buyOrder: Order, sellOrder: Order): number {

    if (buyOrder.orderType === OrderType.MARKET) {
      return sellOrder.price;
    }

    if (sellOrder.orderType === OrderType.MARKET) {
      return buyOrder.price;
    }

    if (buyOrder.createdAt <= sellOrder.createdAt) {
      return buyOrder.price;
    }
    return sellOrder.price;
  }

  
  public getMatchQuantity(buyOrder: Order, sellOrder: Order): number {
    return Math.min(buyOrder.remainingQuantity, sellOrder.remainingQuantity);
  }
}
