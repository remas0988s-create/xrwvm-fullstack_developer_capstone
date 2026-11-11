import { Link, useNavigate, useParams } from 'react-router-dom';
import { useResource } from '../../useResource';

export default function Dealers({ user }) {
  const navigate = useNavigate();
  const { state = '' } = useParams();
  const all = useResource('get_dealers');
  const filtered = useResource(state ? 'get_dealers/' + encodeURIComponent(state) : null);
  const active = state ? filtered : all;
  const states = [...new Set((all.data?.dealers || []).map((dealer) => dealer.state))].sort();

  return <>
    <h1>Find a dealership</h1>
    <p>Browse locations by state and read customer reviews.</p>
    <label className="filter">State
      <select value={state} onChange={(event) => navigate(
        event.target.value ? '/get_dealers/' + encodeURIComponent(event.target.value) : '/get_dealers'
      )}>
        <option value="">All states</option>
        {states.map((value) => <option key={value}>{value}</option>)}
      </select>
    </label>
    {active.error && <p role="alert">{active.error}</p>}
    {!active.data && !active.error && <p>Loading dealerships…</p>}
    {active.data && <div className="panel table-wrap">
      <table><thead><tr><th>Dealer</th><th>City</th><th>Address</th><th>State</th>
        {user && <th>Review Dealer</th>}</tr></thead>
        <tbody>{active.data.dealers.map((dealer) => <tr key={dealer.id}>
          <td><Link to={'/dealer/' + dealer.id}>{dealer.full_name}</Link></td>
          <td>{dealer.city}</td><td>{dealer.address}, {dealer.zip}</td><td>{dealer.state}</td>
          {user && <td><Link to={'/postreview/' + dealer.id}>Review Dealer</Link></td>}
        </tr>)}</tbody>
      </table>
      {!active.data.dealers.length && <p>No dealerships found.</p>}
    </div>}
  </>;
}
