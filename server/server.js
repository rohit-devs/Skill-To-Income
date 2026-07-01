const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');

const { errorHandler, notFound } = require('./middleware/error');

dotenv.config();
require('./config/passport');

const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const port = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: clientUrl, credentials: true },
});

app.set('io', io);

app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json());
app.use(passport.initialize());

app.get('/', (req, res) => {
  res.json({ message: 'SkillEarn V2 API running' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/users', require('./routes/users'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/disputes', require('./routes/disputes'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/applications', require('./routes/applications'));

const { initSocket } = require('./socket');
initSocket(io);

app.use(notFound);
app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skillearn')
  .then(() => {
    console.log('MongoDB connected');
    server.listen(port, () => console.log(`SkillEarn V2 server running on port ${port}`));
  })
  .catch((err) => {
    console.error('MongoDB error:', err);
    process.exit(1);
  });
