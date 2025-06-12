// // filepath: c:\game\rproject\server\index.js
// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const authRoutes = require('./routes/authRoutes');

// dotenv.config();
// const app = express();
// app.use(cors());
// app.use(express.json());

// app.use('/api/auth', authRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });  // ← load root .env
const authRoutes = require('./routes/authRoutes');
// Only uncomment this after creating the chatRoutes file
const chatRoutes = require('./routes/chatRoutes');
const logRoutes = require('./routes/logRoutes');
const profileRoutes = require('./routes/profileRoutes');
const dietRoutes = require('./routes/dietRoutes');
const timelineRoutes = require('./routes/timelineRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/profile',profileRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/timeline', timelineRoutes);

const PORT = process.env.PORT || 5000;
console.log('GROQ_API_KEY is', process.env.GROQ_API_KEY ? 'loaded' : 'MISSING');
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));