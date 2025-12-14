# Google OAuth Setup

1. Create a `.env` in the project root (copy from `.env.example`) and fill in the values:

   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from Google Cloud Console.
   - `JWT_SECRET` a random secret for signing tokens.
   - `SESSION_SECRET` for express-session.
   - Ensure `PORT` matches your desired server port (default `5000`).

2. In Google Cloud Console > OAuth consent screen and Credentials, add an **Authorized redirect URI**:

   - `http://localhost:5000/auth/google/callback`

3. Start the backend server:

```bash
npm run start:server
```

4. Open the following URL to start sign-in (optional redirect param):

```
http://localhost:5000/auth/google
http://localhost:5000/auth/google?redirect=http://localhost:5173/login-success
```

5. On success the server redirects to the frontend with a JWT token as a query param, for example:

```
http://localhost:5173/login-success?token=...
```

6. Verify the token on the frontend or manually decode it at https://jwt.io.

If you'd like, I can wire a simple frontend `/login-success` page to accept the token and show the logged-in user.

### Logout

- Frontend should clear stored user info and navigate to the backend logout route:

```js
localStorage.removeItem('user');
window.location.href = 'http://localhost:5000/auth/logout';
```

- The backend endpoint `GET /auth/logout` will call `req.logout()` and destroy the session, then redirect to the frontend root.
