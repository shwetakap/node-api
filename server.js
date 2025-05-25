// server.js
require('newrelic');

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 5001;

// Use MONGO_URI env var or fallback to localhost
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/node-js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected!');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);  // Exit process if DB connection fails
  }
};

connectDB();

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Bear schema and model
const Schema = mongoose.Schema;

const BearSchema = new Schema({
  name: { type: String, required: true }
});

const Bear = mongoose.models.Bear || mongoose.model('Bear', BearSchema);

// Router setup
const router = express.Router();

// Logging middleware for router
router.use((req, res, next) => {
  console.log('Something is happening.');
  next();
});

// Base test route
router.get('/', (req, res) => {
  res.json({ message: 'hooray! welcome to our api!' });
});

// /api/bears routes
router.route('/bears')
  .post(async (req, res) => {
    try {
      const bear = new Bear({ name: req.body.name });
      await bear.save();
      res.status(201).json({ message: 'Bear created!' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  })
  .get(async (req, res) => {
    try {
      const bears = await Bear.find();
      res.json(bears);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// /api/bears/:bear_id routes
router.route('/bears/:bear_id')
  .get(async (req, res) => {
    try {
      const bear = await Bear.findById(req.params.bear_id);
      if (!bear) return res.status(404).json({ message: 'Bear not found' });
      res.json(bear);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  })
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
  .delete(async (req, res) => {
    try {
      const result = await Bear.deleteOne({ _id: req.params.bear_id });
      if (result.deletedCount === 0) return res.status(404).json({ message: 'Bear not found' });

      res.json({ message: 'Successfully deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// Register router
app.use('/api', router);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Simple /metrics endpoint
app.get('/metrics', (req, res) => {
  const metrics = `
# HELP http_requests_total The total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",endpoint="/metrics"} 1
  `;
  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

// Start server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}

module.exports = { app, connectDB };
