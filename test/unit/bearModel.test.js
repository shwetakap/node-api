const mongoose = require('mongoose');
const { expect } = require('chai');

const BearSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

const Bear = mongoose.models.Bear || mongoose.model('Bear', BearSchema);

describe('Bear Model Unit Tests', () => {
  before(async () => {
    await mongoose.disconnect();
    await mongoose.connect('mongodb://localhost:27017/test-db');
  });

  after(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  it('should be invalid if name is empty', async () => {
    const bear = new Bear();
    try {
      await bear.validate();
      throw new Error('Expected validation to fail');
    } catch (err) {
      expect(err.errors.name).to.exist;
    }
  });

  it('should save a bear with valid name', async () => {
    const bear = new Bear({ name: 'Grizzly' });
    const saved = await bear.save();
    expect(saved.name).to.equal('Grizzly');
  });
});
