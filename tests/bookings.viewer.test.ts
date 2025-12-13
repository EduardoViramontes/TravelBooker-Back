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

    it('debe rechazar a un VIEWER con 403', async () => {
        const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'viwer@test.com',
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

        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty('msg', "El usuario no cuenta con ningún rol con el permiso para realizar esa acción.");
    });
});
