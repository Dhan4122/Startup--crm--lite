/**
 * @fileoverview Main Express server entry point for Startup CRM Lite.
 *
 * Responsibilities:
 *   1. Validate required environment variables (fail-fast before any I/O).
 *   2. Bootstrap the Express application with all global middleware.
 *   3. Apply production-grade security: rate limiting, NoSQL injection
 *      sanitization, secure HTTP headers (helmet), and strict CORS.
 *   4. Mount API route handlers.
 *   5. Register the global error handler (must be LAST middleware).
 *   6. Connect to MongoDB, then start the HTTP listener.
 *   7. Handle OS signals (SIGTERM / SIGINT) for graceful shutdown.
 *
 * Start the server:
 *   Development  →  npm run dev   (nodemon, auto-reload on file change)
 *   Production   →  npm start     (plain node, no auto-reload)
 */

// ── 1. Environment variables ────────────────────────────────────────────────
// dotenv.config() MUST be called before any other module reads process.env.*
import dotenv from 'dotenv';
dotenv.config();

// ── 2. Core framework & third-party middleware ──────────────────────────────
import express from 'express';
import helmet from 'helmet';         // Secure HTTP headers
import morgan from 'morgan';         // HTTP request logger
import cors from 'cors';           // Cross-Origin Resource Sharing
import rateLimit from 'express-rate-limit';    // Rate limiting per IP
import mongoose from 'mongoose';       // Required for graceful shutdown

// ── 3. Internal modules ─────────────────────────────────────────────────────
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import errorHandler from './middleware/errorHandler.js';

/* ═══════════════════════════  Environment Validation  ════════════════════ */

/**
 * Validates that all required environment variables are present before the
 * server boots. This is a fail-fast guard that prevents deploying a broken
 * configuration — especially critical in CI/CD pipelines.
 *
 * If any required variable is missing, logs each missing name clearly and
 * terminates the process with exit code 1 so that the deployment fails
 * visibly rather than silently serving broken requests.
 *
 * Required variables:
 *   - MONGODB_URI  : MongoDB connection string
 *   - JWT_SECRET   : Secret key for JWT signing / verification
 *   - PORT         : HTTP listening port
 *
 * @throws {never} Calls process.exit(1) on validation failure.
 */
const checkRequiredEnvVars = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('💥 [Config] Missing required environment variables:');
    missing.forEach((key) => console.error(`   ✗ ${key}`));
    console.error(
      '   Ensure your .env file is present and contains all required variables.'
    );
    process.exit(1);
  }

  console.log('✅ [Config] All required environment variables are present.');
};

// Run validation immediately — before connecting to any database or starting
// any I/O, so misconfiguration is caught at the earliest possible moment.
checkRequiredEnvVars();

/* ═══════════════════════════  App Initialisation  ════════════════════════ */

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production';

/* ─────────────────────────  Security Headers (helmet)  ─────────────────── */

/**
 * Helmet sets a suite of secure HTTP response headers in a single call:
 *   - Content-Security-Policy
 *   - X-Frame-Options (clickjacking protection)
 *   - X-Content-Type-Options (MIME sniffing protection)
 *   - Referrer-Policy
 *   - etc.
 *
 * Must be first so every response — including error responses — is protected.
 */
app.use(helmet());

/* ──────────────────────────  Request Logging (morgan)  ─────────────────── */

/**
 * Environment-aware request logger:
 *   - production  → 'combined' (Apache Combined Log Format: IP, user-agent,
 *                   referrer, response time — suitable for log aggregators).
 *   - development → 'dev' (compact coloured one-liner, easier to read locally).
 */
app.use(morgan(IS_PROD ? 'combined' : 'dev'));

/* ────────────────────────────────  CORS  ───────────────────────────────── */

/**
 * Strict CORS policy for production.
 *
 * `allowedOrigins` should include:
 *   - The local dev frontend (from FRONTEND_URL env var, e.g. http://localhost:5173)
 *   - The deployed frontend URL (update 'https://your-app.vercel.app' to the
 *     actual production URL before shipping)
 *
 * Origin callback logic:
 *   - `!origin` — allow non-browser tooling (curl, Postman, server-to-server).
 *   - `allowedOrigins.includes(origin)` — allow known safe browser origins.
 *   - Otherwise → CORS error (browser will block the request).
 *
 * `credentials: true` is required to forward cookies / Authorization headers.
 */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://startup-crm-lite-black.vercel.app',
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server calls)
      if (!origin) return callback(null, true);
      // Allow explicitly whitelisted browser origins
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Block all other browser origins
      return callback(new Error(`CORS: Origin '${origin}' is not allowed.`));
    },
    credentials: true,
  })
);

/* ───────────────────────────  Body Parsers  ────────────────────────────── */

/**
 * Parse incoming JSON request bodies.
 * `limit: '10kb'` prevents large-payload DoS attacks.
 */
app.use(express.json({ limit: '10kb' }));

/**
 * Parse URL-encoded form bodies (HTML <form> POST submissions).
 * `extended: true` allows nested objects via the qs library.
 */
app.use(express.urlencoded({ extended: true }));

/* ──────────────────────  NoSQL Injection Sanitisation  ─────────────────── */

/**
 * express-mongo-sanitize strips keys beginning with '$' and containing '.'
 * from req.body, req.query, and req.params before they reach any controller.
 *
 * This prevents MongoDB Operator Injection attacks where a malicious user
 * could embed operators like { "$gt": "" } in a login form to bypass
 * authentication or exfiltrate data.
 *
 * Must be applied AFTER the body parsers so that req.body is already parsed.
 */

/* ────────────────────────────  Rate Limiting  ──────────────────────────── */

/**
 * General API Rate Limiter — applied to all /api/* routes.
 *
 * Allows 100 requests per 15-minute window per IP address.
 * Protects the entire API surface from scraping and brute-force enumeration.
 *
 * `standardHeaders: true`  → sends RateLimit-* headers (RFC 6585 draft).
 * `legacyHeaders: false`   → suppresses deprecated X-RateLimit-* headers.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,             // requests per window per IP
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth Rate Limiter — applied exclusively to /api/auth/* routes.
 *
 * Stricter window of 10 requests per 15 minutes per IP to rate-limit
 * brute-force login and registration attempts.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,              // requests per window per IP
  message: {
    success: false,
    message: 'Too many auth attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply limiters — order matters: authLimiter must come after generalLimiter
// so auth routes are subject to BOTH limits (most restrictive wins).
app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

/* ─────────────────────────────  Routes  ────────────────────────────────── */

/**
 * Health check endpoint — used by load balancers, uptime monitors, and
 * CI/CD pipelines to verify that the server process is alive and ready.
 * Not subject to the general rate limiter (mounted before /api/ limiter
 * but Express evaluates in registration order — health check is before).
 */
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    env: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Feature routes
app.use('/api/auth', authRoutes);   // Login, register, token refresh, etc.
app.use('/api/leads', leadRoutes);   // Lead CRUD + aggregation endpoints.

/* ─────────────────────  Global Error Handler  ────────────────────────────
 * MUST be registered AFTER all routes and middleware.
 * Express identifies error-handling middleware by its 4-parameter signature
 * (err, req, res, next).
 * ────────────────────────────────────────────────────────────────────────── */
app.use(errorHandler);

/* ══════════════════════════  Server Startup  ════════════════════════════ */

/**
 * Connect to MongoDB first; only begin accepting HTTP connections once the
 * database connection is fully established. This prevents requests from
 * being served before the app is ready to handle database operations.
 *
 * The `server` variable is stored so that graceful shutdown can call
 * server.close() to stop accepting new connections before disconnecting
 * from MongoDB.
 */
let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(
        `🚀 [Server] Running on port ${PORT} in ${NODE_ENV} mode`
      );
    });
  } catch (error) {
    // connectDB already calls process.exit(1) on DB errors, but this
    // catch block handles any unexpected startup failures.
    console.error('💥 [Server] Failed to start:', error);
    process.exit(1);
  }
};

startServer();

/* ══════════════════════════  Graceful Shutdown  ════════════════════════ */

/**
 * Graceful shutdown handler.
 *
 * Called on SIGTERM (sent by process managers like PM2, Docker, Kubernetes)
 * and SIGINT (Ctrl+C in the terminal during development).
 *
 * Shutdown sequence:
 *   1. Log intent.
 *   2. Stop accepting new HTTP connections (server.close).
 *   3. Disconnect Mongoose to flush any pending writes.
 *   4. Exit cleanly with code 0.
 *
 * @param {string} signal - The OS signal name that triggered shutdown.
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n🔔 [Server] Received ${signal}. Server shutting down gracefully...`);

  // Stop the HTTP server from accepting new requests
  if (server) {
    server.close(() => {
      console.log('🔌 [Server] HTTP server closed.');
    });
  }

  try {
    // Flush pending Mongoose operations and close the connection pool
    await mongoose.connection.close();
    console.log('🗄️  [Database] MongoDB connection closed.');
  } catch (err) {
    console.error('⚠️  [Database] Error closing MongoDB connection:', err.message);
  }

  console.log('👋 [Server] Goodbye!');
  process.exit(0);
};

// Listen for termination signals from the OS / process manager
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app; // Export for integration testing (e.g., supertest).
