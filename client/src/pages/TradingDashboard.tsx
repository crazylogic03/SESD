import React, { useState, useEffect } from 'react';
import OrderBook from '../components/OrderBook';
import OrderForm from '../components/OrderForm';
import RecentTrades from '../components/RecentTrades';
import { api } from '../services/api';
import { socketService } from '../services/socket';

const TradingDashboard: React.FC = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadWallet = async () => {
    try {
      const data = await api.getWallet();
      setWallet(data);
    } catch {}
  };

  useEffect(() => {
    loadWallet();

    const socket = socketService.getSocket();
    if (socket) {
      socket.on('order:personal', () => {
        loadWallet();
        // Delay one more fetch to ensure DB sync completes
        setTimeout(loadWallet, 500);
      });
    }

    return () => {
      socket?.off('order:personal');
    }
  }, [refreshKey]);

  const handleOrderPlaced = () => {
    setRefreshKey(k => k + 1);
    loadWallet();
  };

  return (
    <div>
      <div className="page-header">
        <h2>⚡ Trading Dashboard</h2>
        <p>Real-time order book with live matching engine</p>
      </div>

      {}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Available Balance</div>
          <div className="stat-value positive">
            ${wallet?.availableBalance?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Reserved (In Orders)</div>
          <div className="stat-value">
            ${wallet?.reservedBalance?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Balance</div>
          <div className="stat-value">
            ${wallet?.balance?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Asset</div>
          <div className="stat-value" style={{ fontSize: '1.2rem' }}>STOCK / USD</div>
        </div>
      </div>

      {}
      <div className="trading-grid">
        <div className="trading-main">
          <OrderBook key={refreshKey} />
          <RecentTrades key={`trades-${refreshKey}`} />
        </div>
        <div className="trading-sidebar">
          <OrderForm onOrderPlaced={handleOrderPlaced} />
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;
