require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
require('./config/firebase'); // Initializes firebase admin

const app = express();
const server = http.createServer(app);

// Connect to database & seed initial verified data
const { seedDatabase } = require('./utils/seedData');
connectDB().then(() => {
  seedDatabase();
}).catch(() => {});

// Initialize Socket.io
initSocket(server);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/medications', require('./routes/medications'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/hospitals', require('./routes/hospitals'));
app.use('/api/schemes', require('./routes/schemes'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/vitals', require('./routes/vitals'));
app.use('/api/triage', require('./routes/triage'));
app.use('/api/care-logs', require('./routes/careLogs'));
app.use('/api/appointments', require('./routes/appointments'));


// Basic route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to ZYVEN API' });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
