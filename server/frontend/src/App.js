import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { api } from './api';
import Header from './components/Header/Header';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Dealers from './components/Dealers/Dealers';
import Dealer from './components/Dealers/Dealer';
import PostReview from './components/Dealers/PostReview';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  useEffect(() => {
    api('session').then((data) => setUser(data.userName)).catch(() => {})
      .finally(() => setSessionReady(true));
  }, []);
  return <>
    <Header user={user} onSignOut={setUser} />
    <main>
      <Routes>
        <Route path="/" element={<Dealers user={user} />} />
        <Route path="/get_dealers/:state?" element={<Dealers user={user} />} />
        <Route path="/login" element={<Login onSignIn={setUser} />} />
        <Route path="/register" element={<Register onSignIn={setUser} />} />
        <Route path="/dealer/:id" element={<Dealer user={user} />} />
        <Route path="/postreview/:id" element={<PostReview user={user} sessionReady={sessionReady} />} />
      </Routes>
    </main>
  </>;
}
