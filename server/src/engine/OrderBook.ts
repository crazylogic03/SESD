

import { BinaryHeap } from './heap/BinaryHeap';
import { Order } from '../domain/models/Order';
import { OrderSide } from '../domain/enums/OrderSide';

export interface OrderBookDepth {
  bids: Array<{ price: number; quantity: number; orderCount: number }>;
  asks: Array<{ price: number; quantity: number; orderCount: number }>;
}

export class OrderBook {
  
  private _buyOrders: BinaryHeap<Order>;

  
  private _sellOrders: BinaryHeap<Order>;

  constructor() {

    this._buyOrders = new BinaryHeap<Order>((a, b) => {
      if (a.price !== b.price) return b.price - a.price; // Higher price first
      return a.createdAt.getTime() - b.createdAt.getTime(); // Earlier time first
    });

    this._sellOrders = new BinaryHeap<Order>((a, b) => {
      if (a.price !== b.price) return a.price - b.price; // Lower price first
      return a.createdAt.getTime() - b.createdAt.getTime(); // Earlier time first
    });
  }

  
  public addOrder(order: Order): void {
    if (order.side === OrderSide.BUY) {
      this._buyOrders.push(order);
    } else {
      this._sellOrders.push(order);
    }
  }

  
  public removeOrder(orderId: string): Order | undefined {

    let removed = this._buyOrders.remove((o) => o.id === orderId);
    if (removed) return removed;

    removed = this._sellOrders.remove((o) => o.id === orderId);
    return removed;
  }

  
  public getTopBuy(): Order | undefined {
    return this._buyOrders.peek();
  }

  
  public getTopSell(): Order | undefined {
    return this._sellOrders.peek();
  }

  
  public popTopBuy(): Order | undefined {
    return this._buyOrders.pop();
  }

  
  public popTopSell(): Order | undefined {
    return this._sellOrders.pop();
  }

  get buyOrderCount(): number {
    return this._buyOrders.size;
  }

  get sellOrderCount(): number {
    return this._sellOrders.size;
  }

  get totalOrderCount(): number {
    return this._buyOrders.size + this._sellOrders.size;
  }

  
  get bestBid(): number | undefined {
    return this._buyOrders.peek()?.price;
  }

  
  get bestAsk(): number | undefined {
    return this._sellOrders.peek()?.price;
  }

  
  get spread(): number | undefined {
    const bid = this.bestBid;
    const ask = this.bestAsk;
    if (bid === undefined || ask === undefined) return undefined;
    return ask - bid;
  }

  
  public getDepth(levels: number = 10): OrderBookDepth {
    const bids = this.aggregateOrders(this._buyOrders.toSortedArray(), levels);
    const asks = this.aggregateOrders(this._sellOrders.toSortedArray(), levels);

    return { bids, asks };
  }

  
  public getAllBuyOrders(): Order[] {
    return this._buyOrders.toSortedArray();
  }

  
  public getAllSellOrders(): Order[] {
    return this._sellOrders.toSortedArray();
  }

  get totalBuyVolume(): number {
    return this._buyOrders
      .toArray()
      .reduce((sum, o) => sum + o.remainingQuantity, 0);
  }

  get totalSellVolume(): number {
    return this._sellOrders
      .toArray()
      .reduce((sum, o) => sum + o.remainingQuantity, 0);
  }

  
  private aggregateOrders(
    orders: Order[],
    levels: number
  ): Array<{ price: number; quantity: number; orderCount: number }> {
    const aggMap = new Map<
      number,
      { quantity: number; orderCount: number }
    >();

    for (const order of orders) {
      const existing = aggMap.get(order.price);
      if (existing) {
        existing.quantity += order.remainingQuantity;
        existing.orderCount += 1;
      } else {
        aggMap.set(order.price, {
          quantity: order.remainingQuantity,
          orderCount: 1,
        });
      }
    }

    return Array.from(aggMap.entries())
      .map(([price, data]) => ({ price, ...data }))
      .slice(0, levels);
  }
}
