

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { WebSocketServerSetup } from './websocket/WebSocketServer';
import { MatchingEngine } from './engine/MatchingEngine';
import { TradeObserver } from './observers/TradeObserver';
import { MarketSimulator } from './services/MarketSimulator';
import { Logger } from './utils/logger';

const logger = new Logger('App');

const app = express();

app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

app.use('/api', routes);

app.get('/health', (_req, res) => {
  const engine = MatchingEngine.getInstance();
  const metrics = engine.getMetrics();
  res.json({
    status: 'healthy',
    uptime: metrics.uptime,
    totalOrders: metrics.totalOrdersProcessed,
    totalTrades: metrics.totalTradesExecuted,
  });
});

app.use(errorHandler);

const httpServer = createServer(app);

new WebSocketServerSetup(httpServer);

const engine = MatchingEngine.getInstance();
const tradeObserver = new TradeObserver();
engine.addObserver(tradeObserver);
logger.info('MatchingEngine initialized (Singleton)');

// Initialize and start the market simulator
const simulator = new MarketSimulator();
simulator.initialize().then(() => {
  simulator.startSimulation();
});

httpServer.listen(config.port, () => {
  logger.info(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║     ⚡ TradeCore Matching Engine v1.0.0          ║
║                                                  ║
║     Server:    http://localhost:${config.port}          ║
║     WebSocket: ws://localhost:${config.port}            ║
║     Env:       ${config.nodeEnv.padEnd(18)}         ║
║                                                  ║
╚══════════════════════════════════════════════════╝
  `);
});

export default app;
