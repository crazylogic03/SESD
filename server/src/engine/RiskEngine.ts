

import { Order } from '../domain/models/Order';
import { OrderSide } from '../domain/enums/OrderSide';
import { Wallet } from '../domain/models/Wallet';
import { Portfolio } from '../domain/models/Portfolio';

export interface RiskValidationResult {
  isValid: boolean;
  errors: string[];
  requiredReservation: number;
}

export class RiskEngine {
  private readonly _maxOrderValue: number;
  private readonly _maxPositionSize: number;
  private readonly _recentOrderIds: Set<string>;

  constructor(
    maxOrderValue: number = 1000000,
    maxPositionSize: number = 10000
  ) {
    this._maxOrderValue = maxOrderValue;
    this._maxPositionSize = maxPositionSize;
    this._recentOrderIds = new Set();
  }

  
  public validateOrder(
    order: Order,
    wallet: Wallet,
    portfolio?: Portfolio
  ): RiskValidationResult {
    const errors: string[] = [];
    let requiredReservation = 0;

    if (this._recentOrderIds.has(order.id)) {
      errors.push('Duplicate order detected');
    }

    if (order.side === OrderSide.BUY) {
      const orderValue = order.price * order.quantity;
      requiredReservation = orderValue;

      if (!wallet.hasSufficientBalance(orderValue)) {
        errors.push(
          `Insufficient balance. Required: ${orderValue.toFixed(2)}, Available: ${wallet.availableBalance.toFixed(2)}`
        );
      }
    }

    if (order.side === OrderSide.SELL) {
      if (!portfolio || portfolio.quantity < order.quantity) {
        const available = portfolio?.quantity || 0;
        errors.push(
          `Insufficient position. Required: ${order.quantity}, Available: ${available}`
        );
      }
    }

    const orderValue = order.price * order.quantity;
    if (orderValue > this._maxOrderValue) {
      errors.push(
        `Order value ${orderValue.toFixed(2)} exceeds maximum ${this._maxOrderValue.toFixed(2)}`
      );
    }

    if (order.quantity > this._maxPositionSize) {
      errors.push(
        `Order quantity ${order.quantity} exceeds position limit ${this._maxPositionSize}`
      );
    }

    if (order.orderType !== 'MARKET' && order.price <= 0) {
      errors.push('Order price must be positive');
    }

    if (errors.length === 0) {
      this._recentOrderIds.add(order.id);

      if (this._recentOrderIds.size > 10000) {
        const iterator = this._recentOrderIds.values();
        this._recentOrderIds.delete(iterator.next().value!);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      requiredReservation,
    };
  }

  
  public checkBalance(wallet: Wallet, requiredAmount: number): boolean {
    return wallet.hasSufficientBalance(requiredAmount);
  }

  
  public clearHistory(): void {
    this._recentOrderIds.clear();
  }
}
