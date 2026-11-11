import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';

export default function Header({ user, onSignOut }) {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function signOut() {
    try {
      await api('logout', {});
      onSignOut(null);
      navigate('/get_dealers');
    } catch (failure) {
      setError(failure.message);
    }
  }

  return <header>
    <nav aria-label="Main navigation">
      <Link className="brand" to="/">Cars Dealership</Link>
      <Link to="/get_dealers">Dealers</Link>
      <a href="/about">About Us</a>
      <a href="/contact">Contact Us</a>
      <div className="account">
        {user ? <><strong>{user}</strong><button onClick={signOut}>Log out</button></>
          : <><Link to="/login">Log in</Link><Link to="/register">Register</Link></>}
      </div>
    </nav>
    {error && <p role="alert">{error}</p>}
  </header>;
}
