import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import { useResource } from '../../useResource';

export default function PostReview({ user, sessionReady }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const dealer = useResource('dealer/' + id);
  const cars = useResource('get_cars');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await api('add_review', { ...data, dealership: id });
      navigate('/dealer/' + id);
    } catch (failure) {
      setError(failure.message);
      setSaving(false);
    }
  }

  if (!sessionReady) return <p>Checking your session…</p>;
  if (!user) return <p><Link to="/login">Log in</Link> to review this dealership.</p>;
  return <section className="panel form">
    <h1>Review Dealer</h1>
    <p>{dealer.data?.dealer[0]?.full_name}</p>
    {(error || cars.error || dealer.error) && <p role="alert">{error || cars.error || dealer.error}</p>}
    <form onSubmit={submit}>
      <label>Review<textarea name="review" rows="4" maxLength="500" required /></label>
      <label>Purchase date<input name="purchase_date" type="date" required /></label>
      <label>Vehicle<select name="car_id" required defaultValue="">
        <option value="" disabled>Select make, model and year</option>
        {cars.data?.CarModels.map((car) => <option key={car.id} value={car.id}>{car.CarMake} {car.CarModel} ({car.CarYear})</option>)}
      </select></label>
      <button disabled={saving || !cars.data || !dealer.data}>{saving ? 'Posting…' : 'Post Review'}</button>
    </form>
  </section>;
}
