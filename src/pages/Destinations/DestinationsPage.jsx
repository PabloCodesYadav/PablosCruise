import { useNavigate } from 'react-router-dom';
import { DESTINATIONS, CRUISES } from '../../data/cruises';
import { useApp } from '../../store/AppContext';
import './DestinationsPage.css';

export default function DestinationsPage() {
  const navigate = useNavigate();
  const { dispatch } = useApp();

  const getCruiseCount = (destId) => CRUISES.filter(c => c.destination === destId && !c.isEscobar).length;
  const getMinPrice = (destId) => {
    const cruises = CRUISES.filter(c => c.destination === destId && !c.isEscobar);
    return cruises.length ? Math.min(...cruises.map(c => c.priceFrom)) : null;
  };

  return (
    <div style={{ paddingTop: 'calc(var(--header-height) + 36px)', paddingBottom: 80 }}>
      {/* Hero */}
      <div className="dest-page__hero">
        <div className="dest-page__hero-overlay" />
        <div className="container dest-page__hero-content">
          <div className="section-tag">🌍 Explore</div>
          <h1 className="section-heading section-heading--white">Our Destinations</h1>
          <p className="section-sub section-sub--white">
            From the sun-drenched Caribbean to the icy majesty of Alaska — 
            the world is your ocean with Pablo Cruises.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="container" style={{ paddingTop: 56 }}>
        <div className="dest-page__grid">
          {DESTINATIONS.map(d => {
            const count = getCruiseCount(d.id);
            const minPrice = getMinPrice(d.id);
            return (
              <div
                key={d.id}
                className="dest-page__card"
                onClick={() => navigate(`/search?destination=${d.id}`)}
              >
                <div className="dest-page__card-img-wrap">
                  <img src={d.image} alt={d.name} className="dest-page__card-img" />
                  <div className="dest-page__card-overlay" />
                  <div className="dest-page__card-flag">{d.flag}</div>
                  {d.popular && <span className="dest-page__popular">Popular</span>}
                </div>
                <div className="dest-page__card-content">
                  <h3 className="dest-page__card-name">{d.name}</h3>
                  <p className="dest-page__card-tagline">{d.tagline}</p>
                  <div className="dest-page__card-footer">
                    <span className="dest-page__card-count">{count} cruise{count !== 1 ? 's' : ''}</span>
                    {minPrice && (
                      <span className="dest-page__card-price">From <strong>${minPrice.toLocaleString()}</strong></span>
                    )}
                  </div>
                  <button className="btn btn--primary btn--sm" style={{ marginTop: 12, width: '100%' }}>
                    View Cruises →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
