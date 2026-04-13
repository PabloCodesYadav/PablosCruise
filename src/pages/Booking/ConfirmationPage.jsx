import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import './BookingPages.css';

export default function ConfirmationPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const cruise = state.selectedCruise;
  const cabin = state.selectedCabin;
  const guest = state.guestDetails;
  const isEscobar = cruise?.isEscobar;

  if (!cruise || !cabin || !guest.firstName) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px', paddingTop: 'calc(var(--header-height) + 80px)' }}>
        <div style={{ fontSize: 48 }}>📋</div>
        <h2>Please complete the booking steps</h2>
        <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={() => navigate('/search')}>Browse Cruises</button>
      </div>
    );
  }

  const totalPrice = cabin.price * (state.search.guests.adults + Math.max(0, state.search.guests.children * 0.7));

  const handleConfirm = () => {
    dispatch({ type: 'CONFIRM_BOOKING', payload: { totalPrice: Math.round(totalPrice) } });
  };

  if (state.booking) {
    return (
      <div className={`booking-page ${isEscobar ? 'booking-page--escobar' : ''}`} style={{ paddingTop: 'calc(var(--header-height) + 60px)', paddingBottom: 80 }}>
        <div className="container--narrow">
          <div className="conf__success">
            <div className={`conf__icon ${isEscobar ? 'conf__icon--gold' : ''}`}>
              {isEscobar ? '✦' : '✓'}
            </div>
            <h1 className={`conf__title ${isEscobar ? 'conf__title--gold' : ''}`}>
              {isEscobar ? 'Your Exclusive Voyage is Reserved' : 'Booking Confirmed!'}
            </h1>
            <p className="conf__sub">
              {isEscobar
                ? 'Your private voyage aboard the Escobar Fleet has been reserved. Our concierge team will contact you within 24 hours with your personalized itinerary and security briefing.'
                : `Thank you, ${guest.firstName}! Your cruise booking is confirmed. A confirmation email will be sent to ${guest.email}.`
              }
            </p>

            <div className={`conf__ref ${isEscobar ? 'conf__ref--escobar' : ''}`}>
              <span className="conf__ref-label">Booking Reference</span>
              <span className="conf__ref-number">{state.booking.id}</span>
            </div>

            <div className={`conf__details ${isEscobar ? 'conf__details--escobar' : ''}`}>
              <div className="conf__detail-row"><span>Cruise</span><strong>{cruise.name}</strong></div>
              <div className="conf__detail-row"><span>Ship</span><strong>{cruise.ship}</strong></div>
              <div className="conf__detail-row"><span>Cabin</span><strong>{cabin.type}</strong></div>
              <div className="conf__detail-row"><span>Guest</span><strong>{guest.firstName} {guest.lastName}</strong></div>
              <div className="conf__detail-row"><span>Departure</span><strong>{new Date(cruise.departureDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong></div>
              <div className="conf__detail-row conf__detail-row--total">
                <span>Total Paid</span>
                <strong className={isEscobar ? 'conf__gold' : 'conf__blue'}>${state.booking.totalPrice.toLocaleString()}</strong>
              </div>
            </div>

            <div className="conf__actions">
              <button className={`btn btn--lg ${isEscobar ? 'btn--gold' : 'btn--primary'}`} onClick={() => { dispatch({ type: 'RESET_BOOKING' }); navigate('/'); }}>
                Back to Home
              </button>
              <button className="btn btn--lg btn--outline" onClick={() => { dispatch({ type: 'RESET_BOOKING' }); navigate('/search'); }}>
                Book Another Cruise
              </button>
            </div>

            {isEscobar && (
              <div className="conf__escobar-note">
                <span className="conf__note-icon">🔒</span>
                <p>Your booking details are encrypted and protected. No digital record of your itinerary will be shared with third parties. El Patrón guarantees your discretion.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`booking-page ${isEscobar ? 'booking-page--escobar' : ''}`} style={{ paddingTop: 'calc(var(--header-height) + 40px)' }}>
      <div className="container--narrow">
        {/* Progress */}
        <div className="booking-progress">
          <div className="booking-progress__step booking-progress__step--done">1. Choose Cruise ✓</div>
          <div className="booking-progress__line" />
          <div className="booking-progress__step booking-progress__step--done">2. Select Cabin ✓</div>
          <div className="booking-progress__line" />
          <div className="booking-progress__step booking-progress__step--done">3. Guest Details ✓</div>
          <div className="booking-progress__line" />
          <div className="booking-progress__step booking-progress__step--active">4. Confirm</div>
        </div>

        <div className="booking-header">
          <h1 className={`booking-title ${isEscobar ? 'booking-title--gold' : ''}`}>
            {isEscobar ? '✦ Confirm Your Exclusive Booking' : 'Review & Confirm'}
          </h1>
        </div>

        <div className={`conf__review ${isEscobar ? 'conf__review--escobar' : ''}`}>
          <div className="conf__review-img">
            <img src={cruise.image} alt={cruise.name} />
          </div>
          <div className="conf__review-details">
            <div className="conf__review-badge">
              <span className={`badge ${isEscobar ? 'badge--gold' : 'badge--primary'}`}>{cruise.badge}</span>
            </div>
            <h2 className={`conf__review-name ${isEscobar ? 'conf__review-name--gold' : ''}`}>{cruise.name}</h2>
            <div className="conf__detail-row"><span>Ship</span><strong>{cruise.ship}</strong></div>
            <div className="conf__detail-row"><span>Cabin</span><strong>{cabin.type} — {cabin.description}</strong></div>
            <div className="conf__detail-row"><span>Departure</span><strong>{new Date(cruise.departureDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></div>
            <div className="conf__detail-row"><span>Return</span><strong>{new Date(cruise.returnDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></div>
            <div className="conf__detail-row"><span>Guest</span><strong>{guest.firstName} {guest.lastName}</strong></div>
            <div className="conf__detail-row"><span>Email</span><strong>{guest.email}</strong></div>
            <div className="conf__detail-row"><span>Adults</span><strong>{state.search.guests.adults}</strong></div>
            {state.search.guests.children > 0 && <div className="conf__detail-row"><span>Children</span><strong>{state.search.guests.children}</strong></div>}
            {guest.specialRequests && <div className="conf__detail-row"><span>Special Requests</span><strong>{guest.specialRequests}</strong></div>}
            <div className="conf__detail-row conf__detail-row--total">
              <span>Total</span>
              <strong className={isEscobar ? 'conf__gold' : 'conf__blue'}>${Math.round(totalPrice).toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {isEscobar && (
          <div className="conf__escobar-note" style={{ margin: '24px 0' }}>
            <span className="conf__note-icon">🔒</span>
            <p>By confirming, you agree to our absolute discretion policy. Your voyage details remain fully encrypted and confidential.</p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          <button className="btn btn--outline" onClick={() => navigate(-1)}>← Edit Details</button>
          <button className={`btn btn--lg ${isEscobar ? 'btn--gold' : 'btn--accent'}`} onClick={handleConfirm}>
            {isEscobar ? '✦ Confirm Exclusive Booking' : 'Confirm & Book →'}
          </button>
        </div>
      </div>
    </div>
  );
}
