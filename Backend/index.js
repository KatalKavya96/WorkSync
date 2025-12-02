const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./auth/routes');
const userRoutes = require('./user/routes');
const taskRoutes = require('./task/routes'); // 👈 new
const { authenticate } = require('./auth/middleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS.split(',').map((origin) =>
      origin.trim()
    ),
    credentials: true,
  })
);

app.use(morgan('dev'));

// Public routes
app.use('/auth', authRoutes);

// Everything below this requires a valid JWT
app.use(authenticate);

app.use('/', userRoutes);
app.use('/tasks', taskRoutes); // 👈 new

app.listen(PORT, () => {
  console.log(`Server now running at port ${PORT}`);
});
