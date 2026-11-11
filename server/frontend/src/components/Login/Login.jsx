import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';

export default function Login({ onSignIn }) {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const result = await api('login', Object.fromEntries(new FormData(event.currentTarget)));
      onSignIn(result.userName);
      navigate('/get_dealers');
    } catch (failure) {
      setError(failure.message);
    }
  }

  return <section className="panel form">
    <h1>Log in</h1>
    <form onSubmit={submit}>
      <label>Username<input name="userName" autoComplete="username" required /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
      {error && <p role="alert">{error}</p>}
      <button>Log in</button>
    </form>
    <Link to="/register">Create an account</Link>
  </section>;
}
