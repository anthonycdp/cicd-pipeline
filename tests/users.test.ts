import request from 'supertest';
import { app } from '../src/app';
import { resetUserStore } from '../src/users/userService';

describe('Users API', () => {
  beforeEach(() => {
    resetUserStore();
  });

  describe('GET /api/users', () => {
    it('should return list of users', async () => {
      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].email).toBe('john@example.com');
      expect(response.body.data[0].createdAt).toEqual(expect.any(String));
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user with normalized input', async () => {
      const newUser = {
        name: '  Test   User  ',
        email: '  TEST@EXAMPLE.COM  ',
      };

      const response = await request(app).post('/api/users').send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test User');
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.createdAt).toEqual(expect.any(String));
      expect(response.body.data.updatedAt).toEqual(expect.any(String));
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app).post('/api/users').send({
        name: '   ',
        email: '',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Name and email are required');
    });

    it('should fail with invalid email', async () => {
      const response = await request(app).post('/api/users').send({
        name: 'Invalid Email User',
        email: 'not-an-email',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email must be valid');
    });

    it('should fail with duplicate email regardless of casing or spaces', async () => {
      const user = { name: 'User 1', email: 'Duplicate@example.com' };

      await request(app).post('/api/users').send(user);
      const response = await request(app).post('/api/users').send({
        name: 'User 2',
        email: '  duplicate@example.com  ',
      });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a user by ID', async () => {
      // First create a user
      const createResponse = await request(app).post('/api/users').send({
        name: 'Get Test User',
        email: 'getuser@example.com',
      });

      const userId = createResponse.body.data.id;

      const response = await request(app).get(`/api/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.createdAt).toEqual(expect.any(String));
      expect(response.body.data.updatedAt).toEqual(expect.any(String));
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).get('/api/users/00000000-0000-0000-0000-000000000000');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update a user with normalized input', async () => {
      const createResponse = await request(app).post('/api/users').send({
        name: 'Update Test User',
        email: 'updateuser@example.com',
      });

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send({ name: '  Updated   Name ', email: ' UPDATED@EXAMPLE.COM ' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.email).toBe('updated@example.com');
    });

    it('should fail when no fields are provided', async () => {
      const createResponse = await request(app).post('/api/users').send({
        name: 'No Update User',
        email: 'noupdate@example.com',
      });

      const response = await request(app).put(`/api/users/${createResponse.body.data.id}`).send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('At least one field must be provided');
    });

    it('should fail when name is blank', async () => {
      const createResponse = await request(app).post('/api/users').send({
        name: 'Blank Name User',
        email: 'blankname@example.com',
      });

      const response = await request(app)
        .put(`/api/users/${createResponse.body.data.id}`)
        .send({ name: '   ' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name cannot be empty');
    });

    it('should fail when email is already in use after normalization', async () => {
      const firstUser = await request(app).post('/api/users').send({
        name: 'First User',
        email: 'first@example.com',
      });
      const secondUser = await request(app).post('/api/users').send({
        name: 'Second User',
        email: 'second@example.com',
      });

      const response = await request(app)
        .put(`/api/users/${secondUser.body.data.id}`)
        .send({ email: ' FIRST@EXAMPLE.COM ' });

      expect(firstUser.status).toBe(201);
      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email already in use');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/api/users/00000000-0000-0000-0000-000000000000')
        .send({ name: 'New Name' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      const createResponse = await request(app).post('/api/users').send({
        name: 'Delete Test User',
        email: 'deleteuser@example.com',
      });

      const userId = createResponse.body.data.id;

      const response = await request(app).delete(`/api/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify user is deleted
      const getResponse = await request(app).get(`/api/users/${userId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).delete('/api/users/00000000-0000-0000-0000-000000000000');

      expect(response.status).toBe(404);
    });
  });
});
