import express from "express";
import cors from "cors";
import passport from "passport";
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";

// Load env vars before initializing passport config
dotenv.config();
// Production env checks (do NOT crash the process in serverless environment).
let configError = null;
if (process.env.NODE_ENV === 'production') {
  const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL', 'JWT_SECRET', 'FRONTEND_URL', 'BACKEND_URL'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    configError = `Missing required env vars in production: ${missing.join(', ')}`;
    console.error(configError);
  }
}

let startupError = null;
try {
  await import('./config/passport.js');
  const mod = await import('./routes/auth.js');
  var authRoutes = mod.default;
} catch (err) {
  startupError = err;
  console.error('Startup import error:', err && err.stack ? err.stack : err);
}

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

// If there was a startup/config error, return a clear 500 on all auth requests
app.use((req, res, next) => {
  if (configError) {
    return res.status(500).json({ error: 'Server misconfiguration', details: configError });
  }
  if (startupError) {
    return res.status(500).json({ error: 'Server startup error', details: String(startupError.message || startupError) });
  }
  return next();
});

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


