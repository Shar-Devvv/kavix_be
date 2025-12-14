import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

const FRONTEND = process.env.FRONTEND_URL || 'https://kavix-two.vercel.app';
const COOKIE_NAME = process.env.COOKIE_NAME || 'kavix_token';
const TOKEN_EXP = process.env.JWT_EXPIRES || '1h';

// Initiate Google OAuth. Optional `redirect` query param will be encoded into state.
router.get('/google', (req, res, next) => {
  const redirect = req.query.redirect || `${FRONTEND}/login-success`;
  const state = Buffer.from(String(redirect)).toString('base64url');
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state,
    prompt: 'select_account',
    session: false,
  })(req, res, next);
});

// Callback: sign JWT, set cookie, redirect back to frontend (state)
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND}/login?error=oauth` }),
  (req, res) => {
    const user = req.user;
    const payload = { sub: user.id, name: user.name, email: user.email };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: TOKEN_EXP });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60,
    };

    res.cookie(COOKIE_NAME, token, cookieOptions);

    let redirect = FRONTEND;
    if (req.query && req.query.state) {
      try {
        redirect = Buffer.from(String(req.query.state), 'base64url').toString();
      } catch (e) {
        // ignore
      }
    }

    res.redirect(redirect);
  }
);

// Return current authenticated user by verifying cookie token or Authorization header
router.get('/me', (req, res) => {
  const token = req.cookies?.[COOKIE_NAME] || (req.headers.authorization || '').split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    return res.json({ user: payload });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout: clear cookie and redirect (optional redirect query param)
router.get('/logout', (req, res) => {
  const redirect = req.query.redirect || FRONTEND;
  res.clearCookie(COOKIE_NAME, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' });
  res.redirect(redirect);
});

export default router;



