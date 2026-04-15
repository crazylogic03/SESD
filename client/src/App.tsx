

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { socketService } from './services/socket';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TradingDashboard from './pages/TradingDashboard';
import OrdersPage from './pages/OrdersPage';
import PortfolioPage from './pages/PortfolioPage';
import WalletPage from './pages/WalletPage';
import AdminDashboard from './pages/AdminDashboard';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    if (user) {
      const socket = socketService.connect();
      socketService.joinUserRoom(user.id);
      socketService.requestOrderBook();

      return () => {
        socketService.disconnect();
      };
    }
  }, [user]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    if (authView === 'login') {
      return <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
    }
    return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <TradingDashboard />;
      case 'orders': return <OrdersPage />;
      case 'portfolio': return <PortfolioPage />;
      case 'wallet': return <WalletPage />;
      case 'admin': return <AdminDashboard />;
      default: return <TradingDashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
