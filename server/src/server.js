const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRouter = require("./routes/authRoutes");

dotenv.config();
const app = express();

const pool = require("./config/dbConnect");

// Middleware
// enable CORS for all routes (temporary during development)
app.use(cors());

// built-in middleware to parse JSON
app.use(express.json());

// simple request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use("/api/auth", authRouter);

//PORT
const PORT = process.env.PORT || 3000;

//Run Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


