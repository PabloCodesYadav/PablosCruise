import { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import './Toast.css';

export default function Toast() {
  const { state } = useApp();
  const [toasts, setToasts] = useState([]);
  const [prev, setPrev] = useState(state.wishlist.length);

  useEffect(() => {
    if (state.wishlist.length > prev) {
      const t = { id: Date.now(), message: '♥ Added to your wishlist', type: 'primary' };
      setToasts(ts => [...ts, t]);
      setTimeout(() => setToasts(ts => ts.filter(x => x.id !== t.id)), 3000);
    } else if (state.wishlist.length < prev) {
      const t = { id: Date.now(), message: '♡ Removed from wishlist', type: 'info' };
      setToasts(ts => [...ts, t]);
      setTimeout(() => setToasts(ts => ts.filter(x => x.id !== t.id)), 3000);
    }
    setPrev(state.wishlist.length);
  }, [state.wishlist.length]);

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`}>{t.message}</div>
      ))}
    </div>
  );
}
