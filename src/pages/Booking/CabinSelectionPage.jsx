import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import './BookingPages.css';

export default function CabinSelectionPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const cruise = state.selectedCruise;

  if (!cruise) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px', paddingTop: 'calc(var(--header-height) + 80px)' }}>
        <div style={{ fontSize: 48 }}>🚢</div>
        <h2>No cruise selected</h2>
        <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={() => navigate('/search')}>Browse Cruises</button>
      </div>
    );
  }

  const handleSelect = (cabin) => {
    dispatch({ type: 'SET_SELECTED_CABIN', payload: cabin });
    navigate('/booking/guests');
  };

  const isEscobar = cruise.isEscobar;

  return (
    <div className={`booking-page ${isEscobar ? 'booking-page--escobar' : ''}`} style={{ paddingTop: 'calc(var(--header-height) + 40px)' }}>
      <div className="container--narrow">
        {/* Progress */}
        <div className="booking-progress">
          <div className="booking-progress__step booking-progress__step--done">1. Choose Cruise ✓</div>
          <div className="booking-progress__line" />
          <div className="booking-progress__step booking-progress__step--active">2. Select Cabin</div>
          <div className="booking-progress__line" />
          <div className="booking-progress__step">3. Guest Details</div>
          <div className="booking-progress__line" />
          <div className="booking-progress__step">4. Confirm</div>
        </div>

        <div className="booking-header">
          <h1 className={`booking-title ${isEscobar ? 'booking-title--gold' : ''}`}>
            {isEscobar ? '✦ Select Your Private Suite' : 'Choose Your Cabin'}
          </h1>
          <p className="booking-sub">
            {cruise.name} · {cruise.duration} Nights · Departing {new Date(cruise.departureDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="cabin-grid">
          {cruise.cabins.map((cabin) => {
            const isSelected = state.selectedCabin?.type === cabin.type;
            const guests = state.search.guests.adults + state.search.guests.children;
            const available = cabin.capacity >= guests;
            return (
              <div
                key={cabin.type}
                className={`cabin-card ${isEscobar ? 'cabin-card--escobar' : ''} ${isSelected ? 'cabin-card--selected' : ''} ${!available ? 'cabin-card--disabled' : ''}`}
                onClick={() => available && handleSelect(cabin)}
              >
                <div className="cabin-card__header">
                  <div>
                    <h3 className="cabin-card__type">{cabin.type}</h3>
                    <p className="cabin-card__desc">{cabin.desc || cabin.description}</p>
                  </div>
                  {isSelected && <div className="cabin-card__check">✓</div>}
                  {!available && <span className="badge badge--accent" style={{ fontSize: 10 }}>Insufficient capacity</span>}
                </div>
                <div className="cabin-card__features">
                  <span>👥 Up to {cabin.capacity} guests</span>
                  {isEscobar && <span>🔐 Private & Exclusive</span>}
                  {!isEscobar && <span>🌊 Ocean views vary</span>}
                </div>
                <div className="cabin-card__footer">
                  <div className="cabin-card__price">
                    <span className="cabin-card__from">From</span>
                    <span className={`cabin-card__amount ${isEscobar ? 'cabin-card__amount--gold' : ''}`}>
                      ${cabin.price.toLocaleString()}
                    </span>
                    <span className="cabin-card__per">/ person</span>
                  </div>
                  <button
                    className={`btn btn--sm ${isEscobar ? 'btn--gold' : 'btn--primary'} ${isSelected ? '' : ''}`}
                    disabled={!available}
                  >
                    {isSelected ? 'Selected ✓' : 'Select'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          <button className="btn btn--outline" onClick={() => navigate(-1)}>← Back</button>
          {state.selectedCabin && (
            <button className={`btn btn--lg ${isEscobar ? 'btn--gold' : 'btn--accent'}`} onClick={() => navigate('/booking/guests')}>
              Continue to Guest Details →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
