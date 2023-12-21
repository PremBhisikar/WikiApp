const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/SearchedData', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema for Analytics
const analyticsSchema = new mongoose.Schema({
    keyword: String,
    page: String,
    timestamp: { type: Date, default: Date.now },
    count: { type: Number, default: 1 }, 
  });  
  

const Analytics = mongoose.model('Analytics', analyticsSchema);

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

app.get('/search', async (req, res) => {
    try {
      const searchTerm = req.query.term;

      // Check if the keyword already exists
      const existingKeyword = await Analytics.findOne({ keyword: searchTerm });
      if (existingKeyword) {
        // If exists, increment the count
        existingKeyword.count += 1;
        await existingKeyword.save();
      } else {
        // If not, create a new record
        const analyticsData = new Analytics({
          keyword: searchTerm,
        });
        await analyticsData.save();
      }
  
      console.log('Searched Keyword:', searchTerm);
  
      const response = await axios.get(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${searchTerm}`
      );
  
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching data from Wikipedia:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  
app.get('/read/:slug', async (req, res) => {
    try {
      const slug = req.params.slug;
  
      const analyticsData = new Analytics({
        page: slug,
      });
      await analyticsData.save();
  
      const response = await axios.get(
        `https://en.wikipedia.org/w/api.php?action=parse&format=json&page=${slug}`
      );
  
      if (response.data.error) {
        res.status(404).json({ error: 'Page not found' });
        return;
      }
  
      const pageData = response.data.parse;
      const title = pageData.title;
      const htmlContent = pageData.text['*'];
  
      res.json({ title, htmlContent });
    } catch (error) {
      console.error('Error fetching page data from Wikipedia:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.get('/most-searched/:order', async (req, res) => {
    try {
      const order = req.params.order.toLowerCase();
  
      if (order !== 'asc' && order !== 'desc') {
        res.status(400).json({ error: 'Invalid order parameter. Use "asc" or "desc".' });
        return;
      }
  
      // Get the most searched keywords
      const mostSearchedKeywords = await Analytics.find()
        .sort({ count: order === 'asc' ? 1 : -1 })
        console.log('Order:', order);
  
      res.json(mostSearchedKeywords);
    } catch (error) {
      console.error('Error fetching most searched keywords:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

// Secret key for JWT
const jwtSecret = process.env.JWT_SECRET || 'defaultSecretKey';

// Middleware to check JWT and identify admin
const authenticateAdmin = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.admin = decoded.admin;
    next();
  } catch (e) {
    res.status(400).json({ msg: 'Token is not valid' });
  }
};

// Admin login route
app.post('/admin/login', (req, res) => {
  // and generate a token if the credentials are valid
  const admin = {
    id: 1,
    username: 'admin',
  };

  jwt.sign({ admin }, jwtSecret, { expiresIn: '1h' }, (err, token) => {
    if (err) throw err;
    res.json({ token });
  });
});

// Protected route accessible only by admins
app.get('/admin/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const mostSearchedKeywords = await Analytics.find().sort({ count: -1 }).limit(5);
    res.json(mostSearchedKeywords);
  } catch (error) {
    console.error('Error fetching most searched keywords:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
