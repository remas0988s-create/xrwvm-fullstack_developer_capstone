import { Link, useParams } from 'react-router-dom';
import { useResource } from '../../useResource';

export default function Dealer({ user }) {
  const { id } = useParams();
  const details = useResource('dealer/' + id);
  const reviews = useResource('reviews/dealer/' + id);
  const dealer = details.data?.dealer[0];
  return <>
    <Link to="/get_dealers">← All dealerships</Link>
    {details.error && <p role="alert">{details.error}</p>}
    {dealer && <><h1>{dealer.full_name}</h1><p>{dealer.address}, {dealer.city}, {dealer.state} {dealer.zip}</p>
      {user && <Link className="button" to={'/postreview/' + id}>Review Dealer</Link>}
      <h2>Customer reviews</h2>
      {reviews.error && <p role="alert">{reviews.error}</p>}
      {reviews.data?.reviews.length === 0 && <p>No reviews yet.</p>}
      <div className="reviews">{reviews.data?.reviews.map((review) => <article className="panel" key={review.id}>
        <strong>{review.name}</strong>
        {review.sentiment && <span className="badge">{review.sentiment}</span>}
        <p>{review.review}</p>
        <small>{review.car_make} {review.car_model} {review.car_year}</small>
      </article>)}</div>
    </>}
  </>;
}
