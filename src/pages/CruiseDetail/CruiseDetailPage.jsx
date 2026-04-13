import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { CRUISES } from '../../data/cruises';
import './CruiseDetailPage.css';

function Stars({ n }) {
  return (
    <div className="stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`star ${i < Math.floor(n) ? '' : 'star--empty'}`}>★</span>
      ))}
    </div>
  );
}

export default function CruiseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const cruise = CRUISES.find(c => c.id === id) || state.selectedCruise;
  const inWishlist = state.wishlist.some(c => c.id === cruise?.id);

  if (!cruise) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <div style={{ fontSize: 48 }}>🚢</div>
        <h2>Cruise not found</h2>
        <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={() => navigate('/search')}>Browse Cruises</button>
      </div>
    );
  }

  const handleBook = () => {
    dispatch({ type: 'SET_SELECTED_CRUISE', payload: cruise });
    navigate('/booking/cabin');
  };

  const handleWishlist = () => dispatch({ type: 'TOGGLE_WISHLIST', payload: cruise });
  const discount = Math.round(((cruise.originalPrice - cruise.priceFrom) / cruise.originalPrice) * 100);

  return (
    <div className={`cd ${cruise.isEscobar ? 'cd--escobar' : ''}`} style={{ paddingTop: 'var(--header-height)' }}>
      {/* Hero */}
      <div className="cd__hero">
        <img src={cruise.image} alt={cruise.name} className="cd__hero-img" />
        <div className="cd__hero-overlay" />
        <div className="container cd__hero-content">
          {cruise.isEscobar && <div className="cd__vip-label">✦ Escobar Fleet — Exclusive Access</div>}
          <span className={`badge ${cruise.isEscobar ? 'badge--gold' : 'badge--accent'}`}>{cruise.badge}</span>
          <h1 className="cd__title">{cruise.name}</h1>
          <div className="cd__meta">
            <div className="cd__rating">
              <Stars n={cruise.rating} />
              <span>{cruise.rating} ({cruise.reviewCount.toLocaleString()} reviews)</span>
            </div>
            <span className="cd__duration">⏱ {cruise.duration} Nights</span>
            <span className="cd__ship">🚢 {cruise.ship}</span>
            <span className="cd__port">⚓ Departs from {cruise.departsFrom}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container cd__body">
        <div className="cd__main">
          {/* Itinerary */}
          <section className="cd__section">
            <h2 className={`cd__section-title ${cruise.isEscobar ? 'cd__section-title--gold' : ''}`}>Itinerary</h2>
            <div className="cd__itinerary">
              {cruise.itinerary.map((port, i) => (
                <div key={i} className="cd__itin-stop">
                  <div className={`cd__itin-dot ${i === 0 || i === cruise.itinerary.length - 1 ? 'cd__itin-dot--end' : ''}`} />
                  {i < cruise.itinerary.length - 1 && <div className="cd__itin-line" />}
                  <div className="cd__itin-label">
                    <span className="cd__itin-day">Day {i + 1}</span>
                    <span className="cd__itin-port">{port}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Highlights */}
          <section className="cd__section">
            <h2 className={`cd__section-title ${cruise.isEscobar ? 'cd__section-title--gold' : ''}`}>What's Included</h2>
            <div className="cd__highlights">
              {cruise.highlights.map(h => (
                <div key={h} className={`cd__highlight ${cruise.isEscobar ? 'cd__highlight--escobar' : ''}`}>
                  <span className="cd__highlight-check">{cruise.isEscobar ? '✦' : '✓'}</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </section>

          {/* About */}
          <section className="cd__section">
            <h2 className={`cd__section-title ${cruise.isEscobar ? 'cd__section-title--gold' : ''}`}>About This Voyage</h2>
            <p className="cd__about">
              {cruise.isEscobar
                ? `Experience the pinnacle of maritime luxury aboard the ${cruise.ship}. This is not simply a cruise — it is an exclusive, private voyage reserved for those who demand absolute perfection. Every detail, from the private itinerary to the personal staff-to-guest ratio, has been curated to deliver an unparalleled experience. Discretion, security, and world-class service are guaranteed.`
                : `Set sail aboard the magnificent ${cruise.ship} on this unforgettable ${cruise.duration}-night journey. Your voyage departs from ${cruise.departsFrom} and takes you through some of the world's most breathtaking destinations. With Pablo Cruises' award-winning hospitality, gourmet dining, and world-class entertainment, every moment at sea is as memorable as your time ashore.`
              }
            </p>
          </section>
        </div>

        {/* Sidebar */}
        <aside className={`cd__sidebar ${cruise.isEscobar ? 'cd__sidebar--escobar' : ''}`}>
          <div className="cd__price-box">
            <div className="cd__sidebar-dates">
              <span>📅 {new Date(cruise.departureDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>→</span>
              <span>{new Date(cruise.returnDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            {cruise.originalPrice > cruise.priceFrom && (
              <div className="cd__sidebar-original">${cruise.originalPrice.toLocaleString()} <span className="badge badge--success">Save {discount}%</span></div>
            )}
            <div className="cd__sidebar-price">
              <span className="cd__sidebar-from">From</span>
              <span className={`cd__sidebar-amount ${cruise.isEscobar ? 'cd__sidebar-amount--gold' : ''}`}>
                ${cruise.priceFrom.toLocaleString()}
              </span>
              <span className="cd__sidebar-per">per person</span>
            </div>
            <button
              className={`btn btn--lg btn--full ${cruise.isEscobar ? 'btn--gold' : 'btn--accent'}`}
              onClick={handleBook}
              style={{ marginTop: 8 }}
            >
              {cruise.isEscobar ? '✦ Request Exclusive Access' : 'Book This Cruise →'}
            </button>
            <button
              className={`btn btn--lg btn--full ${cruise.isEscobar ? 'btn--outline-gold' : 'btn--outline'}`}
              onClick={handleWishlist}
              style={{ marginTop: 12 }}
            >
              {inWishlist ? '♥ Saved to Wishlist' : '♡ Save to Wishlist'}
            </button>
            <div className="cd__trust">
              <span>🔒 Free Cancellation</span>
              <span>✓ Best Price Guarantee</span>
              <span>📞 24/7 Concierge</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
