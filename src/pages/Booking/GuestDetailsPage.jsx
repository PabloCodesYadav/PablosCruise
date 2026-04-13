import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import './BookingPages.css';

export default function GuestDetailsPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const cruise = state.selectedCruise;
  const cabin = state.selectedCabin;
  const isEscobar = cruise?.isEscobar;

  const [form, setForm] = useState({ ...state.guestDetails });
  const [errors, setErrors] = useState({});

  if (!cruise || !cabin) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px', paddingTop: 'calc(var(--header-height) + 80px)' }}>
        <div style={{ fontSize: 48 }}>📋</div>
        <h2>Please start from the beginning</h2>
        <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={() => navigate('/search')}>Browse Cruises</button>
      </div>
    );
  }

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (!form.nationality.trim()) e.nationality = 'Nationality is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    dispatch({ type: 'SET_GUEST_DETAILS', payload: form });
    navigate('/booking/payment');
  };

  const totalPrice = cabin.price * (state.search.guests.adults + Math.max(0, state.search.guests.children * 0.7));

  return (
    <div className={`booking-page ${isEscobar ? 'booking-page--escobar' : ''}`} style={{ paddingTop: 'calc(var(--header-height) + 40px)' }}>
      <div className="container--narrow">
        {/* Progress */}
        <div className="booking-progress">
          <div className="booking-progress__step booking-progress__step--done">1. Cruise ✓</div>
          <div className="booking-progress__line" />
          <div className="booking-progress__step booking-progress__step--done">2. Cabin ✓</div>
          <div className="booking-progress__line" />
          <div className="booking-progress__step booking-progress__step--active">3. Guests</div>
          <div className="booking-progress__line" />
          <div className="booking-progress__step">4. Payment</div>
          <div className="booking-progress__line" />
          <div className="booking-progress__step">5. Confirm</div>
        </div>

        <div className="booking-header">
          <h1 className={`booking-title ${isEscobar ? 'booking-title--gold' : ''}`}>
            {isEscobar ? '✦ Your Details' : 'Guest Information'}
          </h1>
          <p className="booking-sub">
            {cruise.name} · {cabin.type} · ${cabin.price.toLocaleString()}/person
          </p>
        </div>

        <div className="gd__layout">
          <form className="gd__form" onSubmit={handleSubmit}>
            <div className={`gd__section ${isEscobar ? 'gd__section--escobar' : ''}`}>
              <h3 className="gd__section-title">Primary Guest</h3>
              <div className="gd__row">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input className={`form-input ${errors.firstName ? 'form-input--error' : ''}`} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="John" />
                  {errors.firstName && <span className="gd__error">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input className={`form-input ${errors.lastName ? 'form-input--error' : ''}`} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Doe" />
                  {errors.lastName && <span className="gd__error">{errors.lastName}</span>}
                </div>
              </div>
              <div className="gd__row">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input type="email" className={`form-input ${errors.email ? 'form-input--error' : ''}`} value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@example.com" />
                  {errors.email && <span className="gd__error">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input type="tel" className={`form-input ${errors.phone ? 'form-input--error' : ''}`} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
                  {errors.phone && <span className="gd__error">{errors.phone}</span>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nationality *</label>
                <input className={`form-input ${errors.nationality ? 'form-input--error' : ''}`} value={form.nationality} onChange={e => set('nationality', e.target.value)} placeholder="e.g. American" />
                {errors.nationality && <span className="gd__error">{errors.nationality}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Special Requests (Optional)</label>
                <textarea className="form-input" rows={3} value={form.specialRequests} onChange={e => set('specialRequests', e.target.value)}
                  placeholder={isEscobar ? "Your personal preferences, security requirements, dietary needs..." : "Dietary requirements, accessibility needs, celebrations..."}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button type="button" className="btn btn--outline" onClick={() => navigate(-1)}>← Back</button>
              <button type="submit" className={`btn btn--lg ${isEscobar ? 'btn--gold' : 'btn--accent'}`}>
                Review Booking →
              </button>
            </div>
          </form>

          {/* Summary */}
          <div className={`gd__summary ${isEscobar ? 'gd__summary--escobar' : ''}`}>
            <h3 className="gd__summary-title">Booking Summary</h3>
            <div className="gd__summary-img">
              <img src={cruise.image} alt={cruise.name} />
            </div>
            <div className="gd__summary-rows">
              <div className="gd__summary-row"><span>Cruise</span><span>{cruise.name}</span></div>
              <div className="gd__summary-row"><span>Ship</span><span>{cruise.ship}</span></div>
              <div className="gd__summary-row"><span>Duration</span><span>{cruise.duration} nights</span></div>
              <div className="gd__summary-row"><span>Cabin</span><span>{cabin.type}</span></div>
              <div className="gd__summary-row"><span>Adults</span><span>{state.search.guests.adults}</span></div>
              {state.search.guests.children > 0 && <div className="gd__summary-row"><span>Children</span><span>{state.search.guests.children}</span></div>}
              <div className="gd__summary-row gd__summary-row--total">
                <span>Estimated Total</span>
                <span className={isEscobar ? 'gd__summary-gold' : 'gd__summary-price'}>${Math.round(totalPrice).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
