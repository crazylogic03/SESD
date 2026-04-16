

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { socketService } from '../services/socket';

const RecentTrades: React.FC = () => {
  const [trades, setTrades] = useState<any[]>([]);

  const fetchTrades = useCallback(async () => {
    try {
      const data = await api.getRecentTrades();
      setTrades(data.trades || []);
    } catch (err) {

    }
  }, []);

  useEffect(() => {
    fetchTrades();

    socketService.onTradeExecuted((tradeData: any) => {
      setTrades(prev => {
        const newTrades = [tradeData, ...prev];
        return newTrades.slice(0, 12);
      });
    });

    return () => {
      socketService.getSocket()?.off('trade:executed');
    };
  }, [fetchTrades]);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="icon"></span>
          Recent Trades
          <span className="pulse"></span>
        </div>
      </div>

      {trades.length === 0 ? (
        <div className="empty-state">
          <div className="icon"></div>
          <div>No trades yet</div>
        </div>
      ) : (
        trades.slice(0, 12).map((trade, i) => (
          <div className="trade-row" key={i}>
            <span style={{ color: 'var(--buy-primary)', fontWeight: 600 }}>
              {Number(trade.price).toFixed(2)}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {Number(trade.quantity).toFixed(2)}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              {new Date(trade.executedAt).toLocaleTimeString()}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default RecentTrades;
