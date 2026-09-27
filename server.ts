import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from './backend/config/db.js';
import { isMongoConnected, getLastErrorType } from './backend/data/mongoBridge.js';
import authRoutes from './backend/routes/authRoutes.js';
import productRoutes from './backend/routes/productRoutes.js';
import categoryRoutes from './backend/routes/categoryRoutes.js';
import orderRoutes from './backend/routes/orderRoutes.js';
import adminRoutes from './backend/routes/adminRoutes.js';
import storeRoutes from './backend/routes/storeRoutes.js';
import chatRoutes from './backend/routes/chatRoutes.js';
import { errorHandler } from './backend/middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Connect Database & seed demo data
  await connectDB();

  // Basic Middlewares
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/store', storeRoutes);
  app.use('/api/chat', chatRoutes);

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      app: 'FreshMart Full-Stack API',
      database: {
        provider: 'MongoDB Atlas + Embedded Local Replica',
        mongoConfigured: !!process.env.MONGODB_URI,
        mongoConnected: isMongoConnected(),
        statusNote: isMongoConnected()
          ? 'Connected to MongoDB Atlas'
          : getLastErrorType() === 'AUTH_FAILED'
          ? 'Atlas authentication failed: verify user credentials in MongoDB Atlas -> Database Access'
          : 'Waiting for Atlas IP Whitelist (add 0.0.0.0/0 in MongoDB Atlas Network Access)'
      },
      timestamp: new Date().toISOString()
    });
  });

  // Vite integration
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FreshMart] Server running at http://0.0.0.0:${PORT}`);
    console.log(`[FreshMart] Full-Stack APIs mounted at http://0.0.0.0:${PORT}/api/`);
  });
}

startServer().catch((err) => {
  console.error('[FreshMart] Fatal server startup error:', err);
  process.exit(1);
});
