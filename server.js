// BASE SETUP
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 5000;

// MIDDLEWARE
app.use(morgan('dev')); // Log requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// DATABASE SETUP
mongoose.connect('mongodb://localhost:27017/node-js');

const db = mongoose.connection;
db.on('error', (err) => console.error('MongoDB connection error:', err));
db.once('open', () => console.log('MongoDB connected!'));

// BEAR MODEL
const Schema = mongoose.Schema;

const BearSchema = new Schema({
  name: { type: String, required: true }
});

const Bear = mongoose.model('Bear', BearSchema);

// ROUTES FOR API
const router = express.Router();

// Middleware for logging
router.use((req, res, next) => {
  console.log('Something is happening.');
  next();
});

// Base test route
router.get('/', (req, res) => {
  res.json({ message: 'hooray! welcome to our api!' });
});

// /api/bears route
router.route('/bears')
  // Create a new bear
  .post(async (req, res) => {
    try {
      const bear = new Bear({ name: req.body.name });
      await bear.save();
      res.status(201).json({ message: 'Bear created!' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  })

  // Get all bears
  .get(async (req, res) => {
    try {
      const bears = await Bear.find();
      res.json(bears);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// /api/bears/:bear_id route
router.route('/bears/:bear_id')
  // Get a specific bear
  .get(async (req, res) => {
    try {
      const bear = await Bear.findById(req.params.bear_id);
      if (!bear) return res.status(404).json({ message: 'Bear not found' });
      res.json(bear);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  })

  // Update a specific bear
  .put(async (req, res) => {
    try {
      const bear = await Bear.findById(req.params.bear_id);
      if (!bear) return res.status(404).json({ message: 'Bear not found' });

      bear.name = req.body.name || bear.name;
      await bear.save();

      res.json({ message: 'Bear updated!' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  })

  // Delete a specific bear
  .delete(async (req, res) => {
    try {
      const result = await Bear.deleteOne({ _id: req.params.bear_id });
      if (result.deletedCount === 0) return res.status(404).json({ message: 'Bear not found' });

      res.json({ message: 'Successfully deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// REGISTER ROUTES
app.use('/api', router);

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// START SERVER
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Magic happens on port ${port}`);
  });
}

module.exports = app;
