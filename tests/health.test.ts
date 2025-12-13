import request from 'supertest';
import app from '../src/app';
import { sequelize } from '../src/db';

describe('GET /health', () => {
    beforeAll(async () => {
        await sequelize.authenticate();
    });

    afterAll(async () => {
        await sequelize.close();
    });
    
    it('debe responder status=true y database=connected', async () => {
        const res = await request(app).get('/api/health');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status', true);
        expect(res.body).toHaveProperty('checks.database', 'connected');
    });
});
