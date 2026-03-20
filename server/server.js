const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const mongoose   = require('mongoose');
const cors       = require('cors');
const dotenv     = require('dotenv');
const passport   = require('passport');

dotenv.config();
require('./config/passport');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true },
});

// Make io available to routes
app.set('io', io);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/tasks',       require('./routes/tasks'));
app.use('/api/users',       require('./routes/users'));
app.use('/api/payments',    require('./routes/payments'));
app.use('/api/chat',        require('./routes/chat'));
app.use('/api/disputes',    require('./routes/disputes'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/admin',       require('./routes/admin'));

// Health check
app.get('/', (req, res) => res.json({ message: 'SkillEarn V2 API running ✓' }));

// Socket.io
const { initSocket } = require('./socket');
initSocket(io);

// Connect MongoDB + start server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skillearn')
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => console.log(`SkillEarn V2 server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB error:', err));
