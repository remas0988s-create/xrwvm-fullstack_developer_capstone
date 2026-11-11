import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';

export default function Register({ onSignIn }) {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await api('register', data);
      onSignIn(result.userName);
      navigate('/get_dealers');
    } catch (failure) {
      setError(failure.message);
    }
  }

  return <section className="panel form">
    <h1>Create an account</h1>
    <form onSubmit={submit}>
      <label>Username<input name="userName" autoComplete="username" required /></label>
      <label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
      <label>Confirm password<input name="passwordConfirmation" type="password" autoComplete="new-password" required /></label>
      {error && <p role="alert">{error}</p>}
      <button>Create account</button>
    </form>
    <Link to="/login">Already registered? Log in</Link>
  </section>;
}
