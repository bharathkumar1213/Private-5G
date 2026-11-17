import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import apiRoutes from './routes/apiRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: config.corsOrigin === '*' ? true : config.corsOrigin,
  credentials: true,
}));
app.use(express.json());

// Request logger for NOC audit trail
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Fallback for root
app.get('/', (req, res) => {
  res.json({
    service: 'Private 5G Network Operations Monitoring Backend',
    version: '1.0.0',
    documentation: 'Access API routes at /api/*',
    status: 'ACTIVE',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[NOC-ERROR] Unhandled server error:`, err);
  res.status(500).json({
    error: 'Internal server proxy error',
    message: err.message,
  });
});

// Start Server
const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(` Private 5G NOC Monitoring & Proxy Backend`);
  console.log(` Listening on: http://0.0.0.0:${config.port}`);
  console.log(` Prometheus Target:   ${config.prometheusUrl}`);
  console.log(` Alertmanager Target: ${config.alertmanagerUrl}`);
  console.log(` Environment:         ${config.nodeEnv}`);
  console.log(`=======================================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

