const request = require('supertest');
const app = require('../app');

describe('Expense API smoke tests', () => {
  test('GET /api/health returns a healthy response', async () => {
    const response = await request(app).get('/api/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.environment).toBeDefined();
  });

  test('unknown routes return the standard 404 response', async () => {
    const response = await request(app).get('/api/does-not-exist');

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test('expense routes require authentication', async () => {
    const response = await request(app)
      .post('/api/expenses')
      .send({ title: 'A', amount: 0, category: 'Invalid' });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('AUTH_REQUIRED');
  });

  test('protected expense ids require authentication before lookup', async () => {
    const response = await request(app).get('/api/expenses/not-an-id');

    expect(response.statusCode).toBe(401);
    expect(response.body.error.code).toBe('AUTH_REQUIRED');
  });
});
