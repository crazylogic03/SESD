

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const PortfolioPage: React.FC = () => {
  const [positions, setPositions] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [portfolioData, tradesData] = await Promise.all([
          api.getPortfolio(),
          api.getTrades(),
        ]);
        setPositions(portfolioData.positions || []);
        setTrades(tradesData.trades || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="spinner"></div>;

  return (
    <div>
      <div className="page-header">
        <h2>💼 Portfolio</h2>
        <p>Your holdings and trade history</p>
      </div>

      {}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <div className="card-title">
            <span className="icon"></span>
            Current Positions
          </div>
        </div>

        {positions.length === 0 ? (
          <div className="empty-state">
            <div className="icon"></div>
            <div>No positions yet. Start trading!</div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Quantity</th>
                  <th>Avg Price</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {positions.filter(p => Number(p.quantity) > 0).map((pos) => (
                  <tr key={pos.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {pos.assetSymbol}
                    </td>
                    <td>{Number(pos.quantity).toFixed(4)}</td>
                    <td>${Number(pos.averagePrice).toFixed(2)}</td>
                    <td style={{ color: 'var(--buy-primary)', fontWeight: 600 }}>
                      ${(Number(pos.quantity) * Number(pos.averagePrice)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <span className="icon"></span>
            Trade History
          </div>
        </div>

        {trades.length === 0 ? (
          <div className="empty-state">
            <div className="icon"></div>
            <div>No trades yet</div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Value</th>
                  <th>Executed At</th>
                </tr>
              </thead>
              <tbody>
                {trades.slice(0, 20).map((trade) => (
                  <tr key={trade.id}>
                    <td className="price-buy">${Number(trade.price).toFixed(2)}</td>
                    <td>{Number(trade.quantity).toFixed(4)}</td>
                    <td>${(Number(trade.price) * Number(trade.quantity)).toFixed(2)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(trade.executedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;
