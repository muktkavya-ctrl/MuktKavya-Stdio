/**
 * ============================================================================
 * Mukt Kavya - Render 15-Minute Cold Start Bypass (Keep-Alive Service)
 * ============================================================================
 * Free instances on Render spin down into a sleep state after 15 minutes of
 * inactivity. This service periodically pings the deployed server's external
 * URL to register inbound HTTP traffic and keep the container permanently warm.
 *
 * It automatically detects Render's built-in RENDER_EXTERNAL_URL environment
 * variable or custom SERVER_URL / API_URL / KEEP_ALIVE_URL.
 */

/**
 * Pings a target URL and returns status, latency, and response
 * @param {string} url - Target URL to ping
 * @returns {Promise<{success: boolean, status?: number, latencyMs: number, error?: string}>}
 */
export const pingEndpoint = async (url) => {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'MuktKavya-KeepAlive-Bot/1.0 (+https://muktkavya.com)',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      error: error.message,
      latencyMs,
    };
  }
};

/**
 * Initializes the automated keep-alive ping loop for Render deployment
 */
export const startKeepAliveService = () => {
  // Render automatically assigns RENDER_EXTERNAL_URL to free web services
  const targetBaseUrl =
    process.env.RENDER_EXTERNAL_URL ||
    process.env.SERVER_URL ||
    process.env.API_URL ||
    process.env.KEEP_ALIVE_URL;

  const intervalMinutes = parseInt(process.env.KEEP_ALIVE_INTERVAL_MINUTES || '14', 10);
  const intervalMs = Math.max(intervalMinutes, 1) * 60 * 1000;

  if (!targetBaseUrl) {
    console.log(
      `[KeepAlive] ℹ️ Dormant: No external URL detected (RENDER_EXTERNAL_URL or SERVER_URL).` +
      `\n            In production on Render, RENDER_EXTERNAL_URL will activate this automatic 14-min keep-alive ping.`
    );
    return null;
  }

  // Ensure clean target endpoint (preferably /ping or /api/health)
  const cleanBase = targetBaseUrl.trim().replace(/\/$/, '');
  const pingUrl = cleanBase.endsWith('/ping') || cleanBase.endsWith('/api/health')
    ? cleanBase
    : `${cleanBase}/ping`;

  console.log(`\n======================================================`);
  console.log(`💓 Mukt Kavya Keep-Alive Service Activated`);
  console.log(`🎯 Target URL: ${pingUrl}`);
  console.log(`⏱️ Interval: Every ${intervalMinutes} minutes (bypassing Render 15-min idle spin-down)`);
  console.log(`======================================================\n`);

  // First ping: 45 seconds after boot (allows the server to finish binding and SSL to initialize)
  const initialTimeout = setTimeout(async () => {
    const result = await pingEndpoint(pingUrl);
    if (result.success) {
      console.log(
        `[KeepAlive] 💓 Initial Ping: ${result.status} ${result.statusText} (${result.latencyMs}ms) — Render service verified active!`
      );
    } else {
      console.warn(
        `[KeepAlive] ⚠️ Initial Ping Notice: ${result.error || result.status} (${result.latencyMs}ms). Will retry in next interval.`
      );
    }
  }, 45000);

  // Recurring ping every 14 minutes
  const intervalTimer = setInterval(async () => {
    const timestamp = new Date().toISOString();
    const result = await pingEndpoint(pingUrl);

    if (result.success) {
      console.log(
        `[KeepAlive] 💓 [${timestamp}] Ping OK: ${result.status} ${result.statusText} (${result.latencyMs}ms) | Render cold start bypassed!`
      );
    } else {
      console.warn(
        `[KeepAlive] ⚠️ [${timestamp}] Ping Failed: ${result.error || result.status} (${result.latencyMs}ms). Container may still be reachable.`
      );
    }
  }, intervalMs);

  // Return handle for clean teardown if needed
  return {
    stop() {
      clearTimeout(initialTimeout);
      clearInterval(intervalTimer);
      console.log('[KeepAlive] Keep-alive service halted.');
    },
  };
};
