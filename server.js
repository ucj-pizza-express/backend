const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const Order = require('./Models/Order');
const { createCrud } = require('@api-craft/crud-router');
const authMiddleware = require('./middleware/auth');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes); // ✅ Added contact route

// Orders CRUD
app.use('/api/orders', createCrud(Order, {
    excluded: ['delete'],
    middlewares: {
        delete: authMiddleware
    }
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection failed:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
