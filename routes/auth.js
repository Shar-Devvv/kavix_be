import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * START GOOGLE OAUTH
import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

const FRONTEND = process.env.FRONTEND_URL || 'https://kavix-two.vercel.app';
const BACKEND = process.env.BACKEND_URL || 'https://kavix-be.vercel.app';
const COOKIE_NAME = process.env.COOKIE_NAME || 'kavix_token';
const TOKEN_EXP = process.env.JWT_EXPIRES || '1h';

// Start Google OAuth. Optional `redirect` query param sets where to return after login.
router.get('/google', (req, res, next) => {
  const redirect = req.query.redirect || `${FRONTEND}/login-success`;
  // encode desired return url into `state` so it's preserved through OAuth roundtrip
  const state = Buffer.from(String(redirect)).toString('base64url');
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state,
    prompt: 'select_account',
    session: false,
  })(req, res, next);
});

// Callback: receive state, set httpOnly cookie with JWT, and redirect to frontend (state)
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND}/login?error=oauth` }),
  (req, res) => {
    const user = req.user;
    const payload = { sub: user.id, name: user.name, email: user.email };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: TOKEN_EXP });

    // set cookie (secure, httpOnly, SameSite=None) for production cross-site usage
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60, // 1 hour
    };

    res.cookie(COOKIE_NAME, token, cookieOptions);

    // get redirect from state if present
    let redirect = FRONTEND;
    if (req.query && req.query.state) {
      try {
        redirect = Buffer.from(String(req.query.state), 'base64url').toString();
      } catch (e) {
        // ignore and use default
      }
    }

    // redirect to frontend without token in URL
    res.redirect(redirect);
  }
);

// Return current authenticated user by verifying cookie token
router.get('/me', (req, res) => {
  const token = req.cookies?.[COOKIE_NAME] || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    return res.json({ user: payload });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout: clear cookie and redirect. Include optional redirect param.
router.get('/logout', (req, res) => {
  const redirect = req.query.redirect || FRONTEND;
  res.clearCookie(COOKIE_NAME, { httpOnly: true, secure: true, sameSite: 'none' });
  // redirect to an endpoint that forces account chooser next sign-in by using prompt=select_account
  res.redirect(redirect);
});

export default router;
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



