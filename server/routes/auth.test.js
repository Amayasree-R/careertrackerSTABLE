import { jest } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcryptjs';

// Define environment variables for testing
process.env.JWT_SECRET = 'test_secret';

// Use unstable_mockModule for ESM mocking
// We need to mock it as a function (constructor) that also has static methods
const mockSave = jest.fn();
const mockFindOne = jest.fn();

jest.unstable_mockModule('../models/User.js', () => {
  return {
    default: Object.assign(
      jest.fn().mockImplementation(() => ({
        save: mockSave
      })),
      {
        findOne: mockFindOne
      }
    )
  };
});

// Use dynamic imports to ensure mocks are applied
const { default: app } = await import('../app.js');
const { default: User } = await import('../models/User.js');

describe('Auth API Endpoints (ESM Fixed)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    const validUser = {
      username: 'testuser',
      email: 'test@example.com',
      fullName: 'Test User',
      phoneNumber: '1234567890',
      password: 'password123',
      currentStatus: 'Student'
    };

    test('should return 400 if fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ username: 'test' });
      
      expect(res.statusCode).toEqual(400);
    });

    test('should return 400 if user exists', async () => {
      // Access the static mock via the imported User object
      User.findOne.mockResolvedValue({ username: 'testuser' });

      const res = await request(app)
        .post('/api/auth/signup')
        .send(validUser);
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toMatch(/already exists/i);
    });

    test('should create user successfully', async () => {
      User.findOne.mockResolvedValue(null);
      // Mock the save method on instances
      // Since it's a mock implementation, we can't easily access the instance,
      // but we mocked it at the top level
      mockSave.mockResolvedValue({});

      const res = await request(app)
        .post('/api/auth/signup')
        .send(validUser);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toBe('User created successfully');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login successfully', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      User.findOne.mockResolvedValue({
        _id: 'mockId',
        username: 'testuser',
        password: hashedPassword,
        fullName: 'Test User'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });
  });
});
