import request from 'supertest';
import app from '../src/app.js';
import { describe, it, expect } from 'vitest';

describe('GET /', () => {
  it('should return a simple health message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('HRM System API is running');
  });
});
