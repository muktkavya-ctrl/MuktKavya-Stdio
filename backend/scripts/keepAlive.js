#!/usr/bin/env node

/**
 * ============================================================================
 * Standalone Keep-Alive Runner for Mukt Kavya on Render
 * ============================================================================
 * Usage:
 *   node scripts/keepAlive.js
 *   node scripts/keepAlive.js https://your-backend.onrender.com
 *   npm run keep-alive
 *
 * This script runs independently to ping your Render backend every 14 minutes,
 * ensuring the server stays warm and bypasses the 15-minute cold start timeout.
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables from backend/.env if running locally
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Priority: CLI Argument > RENDER_EXTERNAL_URL > SERVER_URL > API_URL > Default
const cliArgUrl = process.argv[2];
const targetUrlRaw =
  cliArgUrl ||
  process.env.RENDER_EXTERNAL_URL ||
  process.env.SERVER_URL ||
  process.env.API_URL ||
  process.env.KEEP_ALIVE_URL;

if (!targetUrlRaw) {
  console.error(`\n❌ Error: No target URL specified!`);
  console.error(`Usage:`);
  console.error(`  node scripts/keepAlive.js https://<your-render-app>.onrender.com`);
  console.error(`Or configure RENDER_EXTERNAL_URL or SERVER_URL in your .env file.\n`);
  process.exit(1);
}

const cleanBase = targetUrlRaw.trim().replace(/\/$/, '');
const pingUrl = cleanBase.endsWith('/ping') || cleanBase.endsWith('/api/health')
  ? cleanBase
  : `${cleanBase}/ping`;

const intervalMinutes = parseInt(process.env.KEEP_ALIVE_INTERVAL_MINUTES || '14', 10);
const intervalMs = Math.max(intervalMinutes, 1) * 60 * 1000;

console.log(`\n======================================================`);
console.log(`🚀 Mukt Kavya Standalone Keep-Alive Monitor`);
console.log(`🎯 Target URL: ${pingUrl}`);
console.log(`⏱️ Interval: Every ${intervalMinutes} minutes (${intervalMs / 1000}s)`);
console.log(`🛡️ Purpose: Prevent Render 15-minute idle sleep & cold starts`);
console.log(`======================================================\n`);

let pingCount = 0;

const sendPing = async () => {
  pingCount += 1;
  const start = Date.now();
  const timeStr = new Date().toLocaleTimeString();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout

    const res = await fetch(pingUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'MuktKavya-External-KeepAlive/1.0',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const latency = Date.now() - start;

    console.log(
      `[#${pingCount}] [${timeStr}] ✅ Ping Success! HTTP ${res.status} ${res.statusText} (${latency}ms) -> Server is WARM`
    );
  } catch (err) {
    const latency = Date.now() - start;
    console.error(
      `[#${pingCount}] [${timeStr}] ⚠️ Ping Error (${latency}ms): ${err.message}`
    );
  }
};

// Immediate ping
sendPing();

// Schedule every 14 minutes
const timer = setInterval(sendPing, intervalMs);

// Handle graceful exit
process.on('SIGINT', () => {
  clearInterval(timer);
  console.log(`\n🛑 Keep-alive monitor stopped. (Total pings sent: ${pingCount})`);
  process.exit(0);
});

process.on('SIGTERM', () => {
  clearInterval(timer);
  console.log(`\n🛑 Keep-alive monitor terminated.`);
  process.exit(0);
});
