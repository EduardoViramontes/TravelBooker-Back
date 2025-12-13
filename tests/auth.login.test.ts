import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { sequelize } from '../src/db';

describe('POST /auth/login', () => {
    beforeAll(async () => {
        await sequelize.authenticate();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('debe autenticar y generar un JWT válido', async () => {
        const res = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'admin@test.com',
            password: 'abc12345'
        });

        expect(res.status).toBe(200);

        expect(res.body).toHaveProperty('token');
        expect(typeof res.body.token).toBe('string');

        const decoded = jwt.verify( res.body.token, process.env.JWT_SECRET as string) as any;

        expect(decoded).toHaveProperty('idUsuario', 1);
        expect(decoded).toHaveProperty('email', 'admin@test.com');
    });
});
