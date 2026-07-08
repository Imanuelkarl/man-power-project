import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.router.js';

// Initialize dotenv
dotenv.config();

// Initialize express app
const app = express();

// Database configuration
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRouter);

// Routes
app.get('/', (req: any, res: { json: (arg0: { message: string; }) => void; }) => {
  res.json({ message: 'Welcome to Man Power Project API' });
});



// Server listening
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
