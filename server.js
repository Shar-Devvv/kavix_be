import express from "express";
import cors from "cors";
import passport from "passport";
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";

// Load env vars before initializing passport config
dotenv.config();

// Production env checks
if (process.env.NODE_ENV === 'production') {
  const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL', 'JWT_SECRET', 'FRONTEND_URL'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.error('Missing required env vars in production:', missing.join(', '));
    process.exit(1);
  }
}

await import('./config/passport.js');
const { default: authRoutes } = await import('./routes/auth.js');

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://kavix-two.vercel.app';

// Allow frontend origin and credentials for session cookies
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// For serverless production, prefer stateless JWT cookies; avoid express-session
app.use(passport.initialize());

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


