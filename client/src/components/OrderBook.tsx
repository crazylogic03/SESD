

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { socketService } from '../services/socket';

interface OrderLevel {
  price: number;
  quantity: number;
  orderCount: number;
}

const OrderBook: React.FC = () => {
  const [bids, setBids] = useState<OrderLevel[]>([]);
  const [asks, setAsks] = useState<OrderLevel[]>([]);

  const fetchOrderBook = useCallback(async () => {
    try {
      const data = await api.getOrderBook();
      setBids(data.orderBook?.bids || []);
      setAsks(data.orderBook?.asks || []);
    } catch (err) {

    }
  }, []);

  useEffect(() => {
    fetchOrderBook();

    socketService.onOrderBookUpdate((update: any) => {
      if (update.buyOrders) setBids(update.buyOrders);
      if (update.sellOrders) setAsks(update.sellOrders);
    });

    return () => {
      socketService.getSocket()?.off('orderbook:update');
    };
  }, [fetchOrderBook]);

  const maxBidQty = Math.max(...bids.map(b => b.quantity), 1);
  const maxAskQty = Math.max(...asks.map(a => a.quantity), 1);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="icon"></span>
          Order Book
          <span className="pulse"></span>
        </div>
      </div>

      <div className="orderbook-container">
        {}
        <div className="orderbook-side">
          <div className="orderbook-header">
            <span>Orders</span>
            <span>Qty</span>
            <span style={{ textAlign: 'right' }}>Bid Price</span>
          </div>
          {bids.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <div style={{ fontSize: '0.8rem' }}>No buy orders</div>
            </div>
          ) : (
            bids.slice(0, 10).map((bid, i) => (
              <div className="orderbook-row" key={`bid-${i}`}>
                <div className="depth-bar buy" style={{ width: `${(bid.quantity / maxBidQty) * 100}%` }}></div>
                <span style={{ color: 'var(--text-muted)' }}>{bid.orderCount}</span>
                <span>{bid.quantity.toFixed(2)}</span>
                <span className="price-buy" style={{ textAlign: 'right' }}>{bid.price.toFixed(2)}</span>
              </div>
            ))
          )}
        </div>

        {}
        <div className="orderbook-side">
          <div className="orderbook-header">
            <span>Ask Price</span>
            <span>Qty</span>
            <span style={{ textAlign: 'right' }}>Orders</span>
          </div>
          {asks.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <div style={{ fontSize: '0.8rem' }}>No sell orders</div>
            </div>
          ) : (
            asks.slice(0, 10).map((ask, i) => (
              <div className="orderbook-row" key={`ask-${i}`}>
                <div className="depth-bar sell" style={{ width: `${(ask.quantity / maxAskQty) * 100}%` }}></div>
                <span className="price-sell">{ask.price.toFixed(2)}</span>
                <span>{ask.quantity.toFixed(2)}</span>
                <span style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{ask.orderCount}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
