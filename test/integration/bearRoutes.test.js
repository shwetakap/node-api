const mongoose = require('mongoose');
const request = require('supertest');
const { app } = require('../../server'); // your Express app

const TEST_DB_URI = 'mongodb://localhost:27017/test-db';

before(async () => {
  if (mongoose.connection.readyState === 0) {
    // Only connect if not connected already
    await mongoose.connect(TEST_DB_URI);
  }
});

after(async () => {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    } catch (err) {
      console.error('Error in after hook:', err);
    }
  }
});

describe('Bear API Integration Tests', () => {
  it('GET /api/bears should get all bears', async () => {
    const res = await request(app)
      .get('/api/bears')
      .expect(200);
    // your assertions here
  });

  // other tests here ...
});
