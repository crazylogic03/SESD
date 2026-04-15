

import React from 'react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const { user, logout } = useAuth();

  const traderNav = [
    { id: 'dashboard', label: 'Trading', icon: '⚡' },
    { id: 'orders', label: 'My Orders', icon: '📋' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' },
    { id: 'wallet', label: 'Wallet', icon: '💰' },
  ];

  const adminNav = [
    { id: 'admin', label: 'Admin Panel', icon: '🛡️' },
  ];

  const navItems = user?.role === 'ADMIN'
    ? [...traderNav, ...adminNav]
    : traderNav;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>TradeCore</h1>
        <span>Matching Engine</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ padding: '8px 16px', marginBottom: '8px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.username}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {user?.role}
          </div>
        </div>
        <button className="nav-item" onClick={logout}>
          <span className="nav-icon"></span>
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
