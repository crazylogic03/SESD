

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { OrderController } from '../controllers/OrderController';
import { TradeController } from '../controllers/TradeController';
import { PortfolioController } from '../controllers/PortfolioController';
import { WalletController } from '../controllers/WalletController';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware } from '../middleware/auth';
import { rbacMiddleware } from '../middleware/rbac';
import {
  validate,
  registerSchema,
  loginSchema,
  placeOrderSchema,
  depositSchema,
} from '../middleware/validator';

const router = Router();

const authController = new AuthController();
const orderController = new OrderController();
const tradeController = new TradeController();
const portfolioController = new PortfolioController();
const walletController = new WalletController();
const adminController = new AdminController();

router.post('/auth/register', validate(registerSchema), authController.register);
router.post('/auth/login', validate(loginSchema), authController.login);
router.get('/auth/me', authMiddleware, authController.getMe);

router.post(
  '/orders',
  authMiddleware,
  validate(placeOrderSchema),
  orderController.placeOrder
);
router.delete('/orders/:id', authMiddleware, orderController.cancelOrder);
router.get('/orders', authMiddleware, orderController.getOrders);
router.get('/orders/active', authMiddleware, orderController.getActiveOrders);
router.get('/orderbook', authMiddleware, orderController.getOrderBook);

router.get('/trades', authMiddleware, tradeController.getTrades);
router.get('/trades/recent', authMiddleware, tradeController.getRecentTrades);
router.get(
  '/trades/price-history',
  authMiddleware,
  tradeController.getPriceHistory
);

router.get('/portfolio', authMiddleware, portfolioController.getPortfolio);

router.get('/wallet', authMiddleware, walletController.getBalance);
router.post(
  '/wallet/deposit',
  authMiddleware,
  validate(depositSchema),
  walletController.deposit
);
router.post(
  '/wallet/withdraw',
  authMiddleware,
  validate(depositSchema),
  walletController.withdraw
);
router.get(
  '/wallet/transactions',
  authMiddleware,
  walletController.getTransactions
);

router.get(
  '/admin/metrics',
  authMiddleware,
  rbacMiddleware('ADMIN'),
  adminController.getMetrics
);
router.get(
  '/admin/trades',
  authMiddleware,
  rbacMiddleware('ADMIN'),
  adminController.getAllTrades
);
router.get(
  '/admin/users',
  authMiddleware,
  rbacMiddleware('ADMIN'),
  adminController.getUsers
);
router.get(
  '/admin/price-history',
  authMiddleware,
  rbacMiddleware('ADMIN'),
  adminController.getPriceHistory
);

export default router;
