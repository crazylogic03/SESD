

import React, { useState } from 'react';
import { api } from '../services/api';

interface OrderFormProps {
  onOrderPlaced?: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onOrderPlaced }) => {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await api.placeOrder(
        orderType,
        side,
        parseFloat(price),
        parseFloat(quantity)
      );

      if (res.success) {
        setResult({ success: true, message: `${side} order placed! ${res.trades.length} trade(s) executed.` });
        setPrice('');
        setQuantity('');
        onOrderPlaced?.();
      } else {
        setResult({ success: false, message: res.errors?.join(', ') || 'Order failed' });
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message });
    } finally {
      setLoading(false);
      setTimeout(() => setResult(null), 4000);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="icon"></span>
          Place Order
        </div>
      </div>

      <div className="side-toggle">
        <button
          className={side === 'BUY' ? 'active-buy' : ''}
          onClick={() => setSide('BUY')}
        >
          Buy
        </button>
        <button
          className={side === 'SELL' ? 'active-sell' : ''}
          onClick={() => setSide('SELL')}
        >
          Sell
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Order Type</label>
          <select
            className="form-input"
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as 'LIMIT' | 'MARKET')}
          >
            <option value="LIMIT">Limit</option>
            <option value="MARKET">Market</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Price (USD)</label>
          <input
            className="form-input"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Quantity</label>
          <input
            className="form-input"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        {price && quantity && (
          <div style={{
            padding: '10px 14px',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Total</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                ${(parseFloat(price || '0') * parseFloat(quantity || '0')).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <button
          type="submit"
          className={`btn btn-full ${side === 'BUY' ? 'btn-buy' : 'btn-sell'}`}
          disabled={loading}
        >
          {loading ? 'Processing...' : `${side} STOCK`}
        </button>
      </form>

      {result && (
        <div
          className={`toast ${result.success ? 'success' : 'error'}`}
          style={{ position: 'relative', bottom: 'auto', right: 'auto', marginTop: '12px' }}
        >
          {result.message}
        </div>
      )}
    </div>
  );
};

export default OrderForm;
