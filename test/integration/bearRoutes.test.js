const mongoose = require('mongoose');
const request = require('supertest');
const { app } = require('../../server');
const Bear = require('../../app/models/Bear'); // path to your Bear model

const TEST_DB_URI = 'mongodb://localhost:27017/test-db';

before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB_URI);
  }
});

beforeEach(async () => {
  await Bear.deleteMany({});
  await Bear.create({ name: 'Test Bear 1' });
});

after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

describe('Bear API Integration Tests', () => {
  it('GET /api/bears should get all bears', async () => {
    const res = await request(app)
      .get('/api/bears')
      .expect(200);

    // Assert response body is array with at least one bear
    if (!Array.isArray(res.body)) throw new Error('Response is not an array');
    if (res.body.length === 0) throw new Error('No bears returned');
    if (res.body[0].name !== 'Test Bear 1') throw new Error('Unexpected bear data');
  });

  // other tests ...
});
