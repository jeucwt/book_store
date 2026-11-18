import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';

import sachRoutes from './routes/sachRoutes.js';
import goiThueRoutes from './routes/goiThueRoutes.js';
import thueRoutes from './routes/thueRoutes.js';
import docRoutes from './routes/docRoutes.js';

import quanTriRoutes from './routes/quanTriRoutes.js';

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/sach', sachRoutes);
app.use('/api/goi-thue', goiThueRoutes);
app.use('/api/thue', thueRoutes);
app.use('/api/doc', docRoutes);

app.use('/api/quan-tri', quanTriRoutes);

app.get('/', (req, res) => res.send('API đang chạy'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server chạy tại port ${PORT}`));