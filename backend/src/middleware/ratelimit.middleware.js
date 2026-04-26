// ratelimit.middleware.js — production-grade rate limiting
const requests = new Map();

const rateLimiter = (maxRequests = 100, windowMs = 60000) => (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const key = `${ip}:${req.path}`;
  const now = Date.now();

  if (!requests.has(key)) {
    requests.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  const record = requests.get(key);

  if (now > record.resetAt) {
    requests.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  if (record.count >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((record.resetAt - now) / 1000)
    });
  }

  record.count++;
  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', maxRequests - record.count);
  next();
};

// Cleanup old entries every 5 min
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of requests.entries()) {
    if (now > val.resetAt) requests.delete(key);
  }
}, 300000);

module.exports = { rateLimiter };
