

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active'>('all');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = filter === 'active'
        ? await api.getActiveOrders()
        : await api.getOrders();
      setOrders(data.orders || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadOrders(); }, [filter]);

  const handleCancel = async (orderId: string) => {
    try {
      await api.cancelOrder(orderId);
      loadOrders();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'badge-pending',
      PARTIAL: 'badge-partial',
      FILLED: 'badge-filled',
      CANCELLED: 'badge-cancelled',
    };
    return `badge ${map[status] || ''}`;
  };

  return (
    <div>
      <div className="page-header">
        <h2>📋 My Orders</h2>
        <p>View and manage your orders</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setFilter('all')}
        >
          All Orders
        </button>
        <button
          className={`btn btn-sm ${filter === 'active' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setFilter('active')}
        >
          Active Only
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner"></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="icon"></div>
            <div>No orders found</div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Side</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Filled</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className={order.side === 'BUY' ? 'badge badge-buy' : 'badge badge-sell'}>
                        {order.side}
                      </span>
                    </td>
                    <td>{order.orderType}</td>
                    <td className={order.side === 'BUY' ? 'price-buy' : 'price-sell'}>
                      ${Number(order.price).toFixed(2)}
                    </td>
                    <td>{Number(order.quantity).toFixed(2)}</td>
                    <td>{Number(order.filledQuantity).toFixed(2)}</td>
                    <td><span className={getStatusBadge(order.status)}>{order.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td>
                      {(order.status === 'PENDING' || order.status === 'PARTIAL') && (
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => handleCancel(order.id)}
                          style={{ color: 'var(--sell-primary)' }}
                        >
                          Cancel
                        </button>
                      )}
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

export default OrdersPage;
