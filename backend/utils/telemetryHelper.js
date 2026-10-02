/**
 * Telemetry & Security Helper for Mukt Kavya Enterprise Audit
 */

export const extractClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = forwarded.split(',').map((ip) => ip.trim());
    return ips[0];
  }
  return (
    req.headers['x-real-ip'] ||
    req.headers['cf-connecting-ip'] ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  ).replace('::ffff:', '');
};

export const parseUserAgent = (uaString = '') => {
  const ua = uaString.toLowerCase();

  // Device detection
  let device = 'Desktop';
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    device = 'Mobile';
  } else if (/ipad|tablet|playbook|silk/i.test(ua)) {
    device = 'Tablet';
  } else if (/bot|crawler|spider|curl|wget|slurp|headless/i.test(ua)) {
    device = 'Bot/Crawler';
  }

  // OS detection
  let os = 'Unknown OS';
  if (/windows nt 10.0/i.test(ua)) os = 'Windows 10/11';
  else if (/windows nt 6.3/i.test(ua)) os = 'Windows 8.1';
  else if (/windows nt 6.1/i.test(ua)) os = 'Windows 7';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  // Browser detection
  let browser = 'Unknown Browser';
  if (/edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
  else if (/chrome|crios/i.test(ua) && !/edg\//i.test(ua)) browser = 'Google Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Apple Safari';
  else if (/bot|crawler|python|curl/i.test(ua)) browser = 'Automated Agent';

  return { device, os, browser };
};

export const inferGeoFromReq = (req, clientIp) => {
  // If cloud provider headers are present (e.g. Cloudflare or AWS CloudFront)
  const cfCountry = req.headers['cf-ipcountry'] || 'IN';
  const cfCity = req.headers['cf-ipcity'] || 'New Delhi';
  const cfRegion = req.headers['cf-region'] || 'Delhi';

  // Client sent geo hint or header fallback
  const clientRegion = req.headers['x-client-region'];
  const clientCity = req.headers['x-client-city'];

  if (clientRegion) {
    return {
      country: 'India',
      countryCode: 'IN',
      region: clientRegion,
      city: clientCity || clientRegion,
      timezone: 'Asia/Kolkata',
    };
  }

  // Local / default fallback for typical Indian regional traffic
  if (clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.startsWith('192.168')) {
    return {
      country: 'India (Local / Dev)',
      countryCode: 'IN',
      region: 'Delhi / NCR',
      city: 'New Delhi',
      timezone: 'Asia/Kolkata',
    };
  }

  return {
    country: cfCountry === 'IN' ? 'India' : cfCountry,
    countryCode: cfCountry,
    region: cfRegion || 'Delhi',
    city: cfCity || 'New Delhi',
    timezone: 'Asia/Kolkata',
  };
};

export const calculateSecurityRisk = (req, ip, uaString = '') => {
  let riskScore = 0;
  const riskFlags = [];

  const ua = uaString.toLowerCase();

  // Check 1: Headless / Scraping tools
  if (!uaString || uaString.length < 10) {
    riskScore += 45;
    riskFlags.push('EMPTY_OR_ANOMALOUS_UA');
  } else if (/curl|wget|python|postman|insomnia|aiohttp|httpclient|urllib/i.test(ua)) {
    riskScore += 40;
    riskFlags.push('SCRIPTED_HTTP_CLIENT');
  } else if (/headless|puppeteer|selenium|playwright|phantomjs/i.test(ua)) {
    riskScore += 50;
    riskFlags.push('HEADLESS_AUTOMATION_PROBE');
  }

  // Check 2: Malicious query patterns
  const url = req.originalUrl || req.url || '';
  if (/(\.\.\/|\.\.\\|<script|union\s+select|\/etc\/passwd)/i.test(url)) {
    riskScore += 80;
    riskFlags.push('PATH_OR_INJECTION_PROBE');
  }

  // Check 3: Private or Tor headers
  if (req.headers['x-tor-exit-node'] || req.headers['x-anonymous-proxy']) {
    riskScore += 60;
    riskFlags.push('ANONYMOUS_PROXY_SIGNATURE');
  }

  return {
    riskScore: Math.min(riskScore, 100),
    riskFlags,
  };
};
