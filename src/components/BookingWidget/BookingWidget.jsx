import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { DESTINATIONS, DEPARTURE_PORTS } from '../../data/cruises';
import './BookingWidget.css';

export default function BookingWidget({ variant = 'hero' }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    destination: state.search.destination || '',
    departurePort: state.search.departurePort || '',
    adults: state.search.guests.adults,
    children: state.search.guests.children,
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch({
      type: 'SET_SEARCH',
      payload: {
        destination: form.destination,
        departurePort: form.departurePort,
        guests: { adults: Number(form.adults), children: Number(form.children) },
      },
    });
    navigate('/search');
  };

  return (
    <div className={`bw bw--${variant}`}>
      {variant === 'hero' && <div className="bw__label">Find Your Perfect Cruise</div>}
      <form className="bw__form" onSubmit={handleSearch}>
        <div className="bw__field">
          <label className="bw__field-label">🌍 Destination</label>
          <select className="bw__select" value={form.destination} onChange={e => set('destination', e.target.value)}>
            <option value="">All Destinations</option>
            {DESTINATIONS.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="bw__divider" />

        <div className="bw__field">
          <label className="bw__field-label">⚓ Departure Port</label>
          <select className="bw__select" value={form.departurePort} onChange={e => set('departurePort', e.target.value)}>
            <option value="">Any Port</option>
            {DEPARTURE_PORTS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="bw__divider" />

        <div className="bw__field bw__field--guests">
          <label className="bw__field-label">👥 Guests</label>
          <div className="bw__guests">
            <div className="bw__guest-row">
              <span>Adults</span>
              <div className="bw__stepper">
                <button type="button" onClick={() => set('adults', Math.max(1, form.adults - 1))}>−</button>
                <span>{form.adults}</span>
                <button type="button" onClick={() => set('adults', Math.min(8, form.adults + 1))}>+</button>
              </div>
            </div>
            <div className="bw__guest-row">
              <span>Children</span>
              <div className="bw__stepper">
                <button type="button" onClick={() => set('children', Math.max(0, form.children - 1))}>−</button>
                <span>{form.children}</span>
                <button type="button" onClick={() => set('children', Math.min(6, form.children + 1))}>+</button>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="bw__submit btn btn--accent btn--lg">
          Search Cruises →
        </button>
      </form>
    </div>
  );
}
