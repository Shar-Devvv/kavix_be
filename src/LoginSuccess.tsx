import { useEffect, useState } from 'react';

export default function LoginSuccess() {
  const [user, setUser] = useState<{ name?: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userObj = { name: payload.name || payload.email };
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('token', token);
      setUser(userObj);

      // remove token from URL to clean up
      window.history.replaceState({}, '', '/');
    } catch (err) {
      console.error('Failed to parse token', err);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    window.location.href = 'http://localhost:5000/auth/logout';
  };

  if (!user) return <div>Signing you in…</div>;

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <button onClick={() => (window.location.href = '/')}>Continue</button>
      <button onClick={logout} style={{ marginLeft: 12 }}>Logout</button>
    </div>
  );
}
