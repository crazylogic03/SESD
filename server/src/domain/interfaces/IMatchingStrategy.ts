

import { Order } from '../models/Order';
import { Trade } from '../models/Trade';

export interface MatchResult {
  trade: Trade;
  buyOrder: Order;
  sellOrder: Order;
}

export interface IMatchingStrategy {
  
  canMatch(buyOrder: Order, sellOrder: Order): boolean;

  
  getExecutionPrice(buyOrder: Order, sellOrder: Order): number;

  
  getMatchQuantity(buyOrder: Order, sellOrder: Order): number;
}
