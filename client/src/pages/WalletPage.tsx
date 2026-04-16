

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const WalletPage: React.FC = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const load = async () => {
    try {
      const [walletData, txData] = await Promise.all([
        api.getWallet(),
        api.getTransactions(),
      ]);
      setWallet(walletData);
      setTransactions(txData.transactions || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setActionLoading(true);
    try {
      await api.deposit(parseFloat(amount));
      setAmount('');
      setMessage({ type: 'success', text: `Deposited $${parseFloat(amount).toFixed(2)} successfully!` });
      load();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
    setActionLoading(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setActionLoading(true);
    try {
      await api.withdraw(parseFloat(amount));
      setAmount('');
      setMessage({ type: 'success', text: `Withdrawn $${parseFloat(amount).toFixed(2)} successfully!` });
      load();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
    setActionLoading(false);
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) return <div className="spinner"></div>;

  const getTxBadge = (type: string) => {
    const map: Record<string, { class: string; label: string }> = {
      DEPOSIT: { class: 'badge-filled', label: 'Deposit' },
      WITHDRAWAL: { class: 'badge-sell', label: 'Withdraw' },
      TRADE_BUY: { class: 'badge-buy', label: 'Trade Buy' },
      TRADE_SELL: { class: 'badge-pending', label: 'Trade Sell' },
    };
    return map[type] || { class: '', label: type };
  };

  return (
    <div>
      <div className="page-header">
        <h2>💰 Wallet</h2>
        <p>Manage your balance and view transactions</p>
      </div>

      {}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Balance</div>
          <div className="stat-value">${wallet?.balance?.toFixed(2) || '0.00'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Available</div>
          <div className="stat-value positive">${wallet?.availableBalance?.toFixed(2) || '0.00'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Reserved</div>
          <div className="stat-value" style={{ color: 'var(--accent-amber)' }}>
            ${wallet?.reservedBalance?.toFixed(2) || '0.00'}
          </div>
        </div>
      </div>

      {}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <div className="card-title">
            <span className="icon"></span>
            Deposit & Withdraw
          </div>
        </div>

        {message && (
          <div className={`toast ${message.type}`}
            style={{ position: 'relative', bottom: 'auto', right: 'auto', marginBottom: '12px' }}>
            {message.text}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Amount (USD)</label>
          <input
            className="form-input"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-buy" onClick={handleDeposit} disabled={actionLoading} style={{ flex: 1 }}>
            Deposit
          </button>
          <button className="btn btn-sell" onClick={handleWithdraw} disabled={actionLoading} style={{ flex: 1 }}>
            Withdraw
          </button>
        </div>
      </div>

      {}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <span className="icon"></span>
            Transaction History
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="icon"></div>
            <div>No transactions yet</div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 30).map((tx) => {
                  const badge = getTxBadge(tx.transactionType);
                  return (
                    <tr key={tx.id}>
                      <td><span className={`badge ${badge.class}`}>{badge.label}</span></td>
                      <td style={{ fontWeight: 600 }}>${Number(tx.amount).toFixed(2)}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
