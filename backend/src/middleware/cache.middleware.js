// cache.middleware.js — Redis caching for worker search
const redis = require('redis');

let client = null;
const cache = new Map(); // fallback in-memory cache

const connectRedis = async () => {
  try {
    client = redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    client.on('error', () => { client = null; }); // silently fallback
    await client.connect();
    console.log('✅ Redis Connected');
  } catch {
    console.log('⚠️  Redis not available — using in-memory cache');
    client = null;
  }
};

connectRedis();

const cacheMiddleware = (ttl = 60) => async (req, res, next) => {
  const key = `cache:${req.originalUrl}`;
  try {
    let cached = client ? await client.get(key) : cache.get(key);
    if (cached) {
      const data = typeof cached === 'string' ? JSON.parse(cached) : cached;
      return res.json({ ...data, fromCache: true });
    }
  } catch {}

  res.sendCached = async (data) => {
    try {
      const str = JSON.stringify(data);
      if (client) await client.setEx(key, ttl, str);
      else { cache.set(key, data); setTimeout(() => cache.delete(key), ttl * 1000); }
    } catch {}
    res.json(data);
  };
  next();
};

const invalidateCache = async (pattern) => {
  try {
    if (client) {
      const keys = await client.keys(`cache:*${pattern}*`);
      if (keys.length) await client.del(keys);
    } else {
      for (const key of cache.keys()) { if (key.includes(pattern)) cache.delete(key); }
    }
  } catch {}
};

module.exports = { cacheMiddleware, invalidateCache };
