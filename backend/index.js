require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRoute = require('./src/routes/userRoute');
const taskRoute = require('./src/routes/taskRoute');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoute);
app.use('/api/tasks', taskRoute);

app.get('/', (req, res) => {
  res.send('Welcome to the backend server!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});