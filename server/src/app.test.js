process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';

const request = require('supertest');
const app = require('./app');

describe('API discovery routes', () => {
  test.each(['/', '/api', '/api/v1'])('%s describes the API connection contract', async (path) => {
    const response = await request(app).get(path).expect(200);

    expect(response.body).toMatchObject({
      success: true,
      message: 'AgriculNet API is running',
      version: '1.0.0',
      apiBase: '/api/v1',
      health: '/api/health'
    });
  });

  test('keeps unknown routes as 404 responses', async () => {
    const response = await request(app).get('/not-a-real-route').expect(404);

    expect(response.body).toMatchObject({
      success: false,
      message: 'Route not found',
      error: { code: 'NOT_FOUND' }
    });
  });

  test('allows an alternate local Next.js port without wildcard CORS', async () => {
    const response = await request(app)
      .options('/api/v1/listings')
      .set('Origin', 'http://localhost:3001')
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'content-type')
      .expect(204);

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3001');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });
});
