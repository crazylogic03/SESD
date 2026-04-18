

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [metricsData, usersData, tradesData] = await Promise.all([
        api.getMetrics(),
        api.getAllUsers(),
        api.getAllTrades(),
      ]);
      setMetrics(metricsData);
      setUsers(usersData.users || []);
      setTrades(tradesData.trades || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="spinner"></div>;

  return (
    <div>
      <div className="page-header">
        <h2>🛡️ Admin Dashboard</h2>
        <p>System performance monitoring and management</p>
      </div>

      {}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Orders Processed</div>
          <div className="stat-value">{metrics?.engine?.totalOrdersProcessed || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Trades Executed</div>
          <div className="stat-value positive">{metrics?.engine?.totalTradesExecuted || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Orders / Second</div>
          <div className="stat-value">{metrics?.engine?.ordersPerSecond || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Match Latency</div>
          <div className="stat-value">{metrics?.engine?.averageMatchLatencyMs || 0}ms</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{metrics?.system?.totalUsers || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Engine Uptime</div>
          <div className="stat-value">{Math.floor(metrics?.engine?.uptime || 0)}s</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">24h Trade Volume</div>
          <div className="stat-value">{metrics?.volume?.last24h?.totalVolume?.toFixed(2) || '0'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">24h Trade Value</div>
          <div className="stat-value positive">${metrics?.volume?.last24h?.totalValue?.toFixed(2) || '0'}</div>
        </div>
      </div>

      {}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <div className="card-title">
            <span className="icon"></span>
            Users ({users.length})
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.role === 'ADMIN' ? 'badge-sell' : 'badge-buy'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <span className="icon"></span>
            All Trades ({trades.length})
            <span className="pulse"></span>
          </div>
        </div>
        {trades.length === 0 ? (
          <div className="empty-state">
            <div className="icon"></div>
            <div>No trades executed yet</div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Value</th>
                  <th>Executed</th>
                </tr>
              </thead>
              <tbody>
                {trades.slice(0, 50).map((trade) => (
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

export default AdminDashboard;
