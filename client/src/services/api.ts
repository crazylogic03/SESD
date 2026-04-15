

const API_BASE = '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('tradecore_token');
  }

  public setToken(token: string): void {
    this.token = token;
    localStorage.setItem('tradecore_token', token);
  }

  public clearToken(): void {
    this.token = null;
    localStorage.removeItem('tradecore_token');
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  async register(username: string, email: string, password: string, role?: string) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, role }),
    });
  }

  async login(username: string, password: string) {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  async placeOrder(orderType: string, side: string, price: number, quantity: number) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify({ orderType, side, price, quantity }),
    });
  }

  async cancelOrder(orderId: string) {
    return this.request<any>(`/orders/${orderId}`, { method: 'DELETE' });
  }

  async getOrders() {
    return this.request<any>('/orders');
  }

  async getActiveOrders() {
    return this.request<any>('/orders/active');
  }

  async getOrderBook() {
    return this.request<any>('/orderbook');
  }

  async getTrades() {
    return this.request<any>('/trades');
  }

  async getRecentTrades() {
    return this.request<any>('/trades/recent');
  }

  async getPriceHistory() {
    return this.request<any>('/trades/price-history');
  }

  async getPortfolio() {
    return this.request<any>('/portfolio');
  }

  async getWallet() {
    return this.request<any>('/wallet');
  }

  async deposit(amount: number) {
    return this.request<any>('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async withdraw(amount: number) {
    return this.request<any>('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async getTransactions() {
    return this.request<any>('/wallet/transactions');
  }

  async getMetrics() {
    return this.request<any>('/admin/metrics');
  }

  async getAllTrades() {
    return this.request<any>('/admin/trades');
  }

  async getAllUsers() {
    return this.request<any>('/admin/users');
  }
}

export const api = new ApiService();
