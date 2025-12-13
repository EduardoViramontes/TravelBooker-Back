import request from 'supertest';
import app from '../src/app';
import { sequelize } from '../src/db';

describe('POST /auth/login', () => {
    beforeAll(async () => {
        await sequelize.authenticate();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('debe generar booking con 200', async () => {
        const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'agent@test.com',
            password: 'abc12345'
        });

        expect(loginRes.status).toBe(200);
        expect(loginRes.body).toHaveProperty('token');

        const token = loginRes.body.token;

        const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
            customerName: 'eduardo viramontes',
            customerEmail: 'eduardo_viramontes@icloud.com',
            idDestination: 5,
            travelDate: '2026-01-26'
        });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data.id');
        expect(typeof res.body.data.id).toBe('number');
    });
});
