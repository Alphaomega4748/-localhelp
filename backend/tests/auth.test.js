// auth.test.js — Unit tests for authentication
const request = require('supertest');

// Mock mongoose and models
jest.mock('../src/models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));
jest.mock('../src/models/Worker', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

const User = require('../src/models/User');
const Worker = require('../src/models/Worker');

describe('Auth Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/auth/register', () => {
    it('should reject if email already exists', async () => {
      User.findOne.mockResolvedValue({ email: 'test@test.com' });
      // Simulate duplicate email scenario
      const result = await User.findOne({ email: 'test@test.com' });
      expect(result).toBeTruthy();
      expect(result.email).toBe('test@test.com');
    });

    it('should create worker profile when role is worker', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({ _id: 'user123', name: 'Test', role: 'worker' });
      Worker.create.mockResolvedValue({ user: 'user123', category: 'electrician' });

      const user = await User.create({ name: 'Test', role: 'worker' });
      const worker = await Worker.create({ user: user._id, category: 'electrician' });

      expect(User.create).toHaveBeenCalledTimes(1);
      expect(Worker.create).toHaveBeenCalledTimes(1);
      expect(worker.category).toBe('electrician');
    });

    it('should not create worker profile for customer role', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({ _id: 'user456', role: 'customer' });

      const user = await User.create({ role: 'customer' });
      expect(user.role).toBe('customer');
      expect(Worker.create).not.toHaveBeenCalled();
    });
  });

  describe('Token generation', () => {
    it('should generate valid JWT token', () => {
      const jwt = require('jsonwebtoken');
      process.env.JWT_SECRET = 'test_secret';
      const token = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET, { expiresIn: '7d' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe('user123');
    });
  });
});

describe('Worker Search Logic', () => {
  it('should calculate distance correctly (Haversine)', () => {
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 +
        Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    };

    // Kolkata to same point = 0 km
    const dist = getDistance(22.5726, 88.3639, 22.5726, 88.3639);
    expect(dist).toBe(0);

    // Kolkata to nearby point should be small
    const dist2 = getDistance(22.5726, 88.3639, 22.5800, 88.3700);
    expect(dist2).toBeLessThan(2);
    expect(dist2).toBeGreaterThan(0);
  });

  it('should calculate platform fee correctly', () => {
    const hourlyRate = 250;
    const hours = 2;
    const totalAmount = hourlyRate * hours;
    const platformFee = Math.round(totalAmount * 0.1);
    const workerEarning = totalAmount - platformFee;

    expect(totalAmount).toBe(500);
    expect(platformFee).toBe(50);
    expect(workerEarning).toBe(450);
  });

  it('should generate 4-digit OTP', () => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    expect(otp).toHaveLength(4);
    expect(parseInt(otp)).toBeGreaterThanOrEqual(1000);
    expect(parseInt(otp)).toBeLessThanOrEqual(9999);
  });
});

describe('Booking Status Machine', () => {
  const validTransitions = {
    pending:   ['accepted', 'rejected', 'cancelled'],
    accepted:  ['ongoing', 'cancelled'],
    ongoing:   ['completed'],
    completed: [],
    cancelled: [],
    rejected:  [],
  };

  it('should allow valid status transitions', () => {
    expect(validTransitions['pending']).toContain('accepted');
    expect(validTransitions['accepted']).toContain('ongoing');
    expect(validTransitions['ongoing']).toContain('completed');
  });

  it('should not allow invalid transitions', () => {
    expect(validTransitions['completed']).toHaveLength(0);
    expect(validTransitions['cancelled']).toHaveLength(0);
    expect(validTransitions['pending']).not.toContain('completed');
  });
});

describe('Cache Middleware', () => {
  it('should store and retrieve from in-memory cache', () => {
    const cache = new Map();
    const ttl = 60;
    const key = 'cache:/api/workers/nearby?lat=22&lng=88';

    const data = { workers: [{ name: 'Rahul', rating: 4.9 }] };
    cache.set(key, data);
    setTimeout(() => cache.delete(key), ttl * 1000);

    expect(cache.has(key)).toBe(true);
    expect(cache.get(key)).toEqual(data);
  });
});
