import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * START GOOGLE OAUTH
 * - Stores frontend redirect
 * - Forces Google account chooser every time
 */
router.get(
  '/google',
  (req, res, next) => {
    const redirect =
      req.query.redirect ||
      process.env.FRONTEND_URL ||
      'https://kavix-two.vercel.app/login-success';

    if (req.session) {
      req.session.returnTo = redirect;
    }

    next();
  },
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account', // ✅ FORCE ACCOUNT CHOOSER
  })
);

/**
 * GOOGLE CALLBACK
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: true,
    failureRedirect: '/login',
  }),
  (req, res) => {
    const user = req.user;

    // Create JWT for frontend usage
    const token = jwt.sign(
      user,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    // Decide redirect URL
    const redirect =
      (req.session && req.session.returnTo) ||
      process.env.FRONTEND_URL ||
      'https://kavix-two.vercel.app/login-success';

    if (req.session) {
      delete req.session.returnTo;
    }

    // Attach token to redirect URL
    const url = new URL(redirect);
    url.searchParams.set('token', token);

    res.redirect(url.toString());
  }
);

/**
 * GET CURRENT USER (SESSION BASED)
 */
router.get('/me', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.json(req.user);
  }
  return res.status(401).json({ error: 'Not authenticated' });
});

/**
 * LOGOUT
 */
router.get('/logout', (req, res) => {
  const redirect = 'https://kavix-two.vercel.app/home';

  req.logout(function (err) {
    if (err) {
      console.error('Logout error:', err);
    }

    if (req.session) {
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect(redirect);
      });
    } else {
      res.redirect(redirect);
    }
  });
});

export default router;
