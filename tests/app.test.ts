import request from 'supertest';
import { app } from '../src/app';

describe('Root Endpoint', () => {
  it('should return welcome message', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('Welcome');
    expect(response.body.version).toBeDefined();
    expect(response.body.endpoints).toBeDefined();
  });
});

describe('Error Handling', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
