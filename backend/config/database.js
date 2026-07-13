/**
 * @fileoverview MongoDB connection configuration.
 *
 * Exports a single `connectDB` function that establishes a Mongoose
 * connection to MongoDB Atlas using the URI stored in environment variables.
 * The process is terminated with a non-zero exit code on any connection failure
 * so that the host process (PM2, Docker, etc.) can restart and alert.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file into process.env.
// Must be called before reading any process.env.* values.
dotenv.config();

import dns from 'dns';

/**
 * Connects the application to MongoDB Atlas via Mongoose.
 *
 * - Reads the connection string from `process.env.MONGODB_URI`.
 * - Logs the connected host on success.
 * - If DNS resolution fails (common on some Windows/VPN environments), 
 *   falls back to Google/Cloudflare public DNS servers and retries.
 * - Logs the error and exits the process on failure.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when the connection is established.
 *
 * @example
 * // In server.js
 * import connectDB from './config/database.js';
 * await connectDB();
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    // Log the Atlas cluster host so it is easy to confirm which environment
    // the server has connected to (dev cluster vs. prod cluster).
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    // Check if the error is likely a DNS resolution issue.
    const isDnsError = 
      error.code === 'ECONNREFUSED' || 
      error.code === 'ENOTFOUND' || 
      (error.syscall && error.syscall.startsWith('query'));

    if (isDnsError) {
      console.warn('⚠️ MongoDB connection failed due to DNS resolution error. Retrying with public DNS servers (8.8.8.8, 1.1.1.1)...');
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Atlas Connected (via public DNS): ${conn.connection.host}`);
        return;
      } catch (retryError) {
        console.error('❌ MongoDB connection retry failed:', retryError);
      }
    } else {
      console.error('❌ MongoDB connection error:', error);
    }
    
    // exit(1) signals an abnormal termination to the OS / process manager.
    process.exit(1);
  }
};

export default connectDB;
