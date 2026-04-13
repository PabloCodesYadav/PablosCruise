import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { CRUISES, ESCOBAR_FLEET_SHIPS } from '../../data/cruises';
import CruiseCard from '../../components/CruiseCard/CruiseCard';
import './EscobarFleetPage.css';

export default function EscobarFleetPage() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const escobarCruises = CRUISES.filter(c => c.isEscobar);

  return (
    <div className="ef-page">
      {/* Hero */}
      <div className="ef-hero">
        <div className="ef-hero__particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="ef-hero__particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }} />
          ))}
        </div>
        <img src="/escobar_fleet.png" alt="Escobar Fleet" className="ef-hero__bg" />
        <div className="ef-hero__overlay" />
        <div className="container ef-hero__content">
          <div className="ef-hero__crown">✦ ✦ ✦</div>
          <div className="ef-hero__pre">Strictly By Invitation Only</div>
          <h1 className="ef-hero__title">The Escobar Fleet</h1>
          <div className="ef-hero__divider" />
          <p className="ef-hero__sub">
            A legendary collection of private mega-yachts for those who demand 
            absolute exclusivity, unwavering discretion, and unrivalled luxury at sea.
            Not every experience can be purchased. Some must be earned.
          </p>
          <div className="ef-hero__stats">
            <div className="ef-hero__stat"><span>2</span><span>Private Ships</span></div>
            <div className="ef-hero__stat-divider" />
            <div className="ef-hero__stat"><span>48–64</span><span>Guests Maximum</span></div>
            <div className="ef-hero__stat-divider" />
            <div className="ef-hero__stat"><span>100%</span><span>Private Itinerary</span></div>
            <div className="ef-hero__stat-divider" />
            <div className="ef-hero__stat"><span>5★</span><span>Every Voyage</span></div>
          </div>
          <div className="ef-hero__actions">
            <button className="btn btn--gold btn--lg" onClick={() => navigate('/search?escobar=true')}>
              ✦ View Exclusive Voyages
            </button>
            <button className="btn btn--outline-gold btn--lg" onClick={() => {
              document.getElementById('ef-apply').scrollIntoView({ behavior: 'smooth' });
            }}>
              Request Invitation
            </button>
          </div>
        </div>
      </div>

      {/* What Sets It Apart */}
      <section className="ef-section ef-section--dark">
        <div className="container">
          <div className="ef-tag">✦ The Difference</div>
          <h2 className="ef-heading">Beyond Luxury. Beyond Expectation.</h2>
          <div className="ef-divider" />
          <div className="ef-pillars">
            {[
              { icon: '🔐', title: 'Absolute Privacy', desc: 'No shared itineraries. No published routes. Your voyage exists only for you. Zero digital footprint option available.' },
              { icon: '👑', title: 'Elite Staff Ratio', desc: 'A dedicated crew of over 120 for a maximum of 64 guests. The finest butler, chef, and concierge professionals on earth.' },
              { icon: '🚁', title: 'Helicopter Access', desc: 'Every Escobar Fleet yacht is equipped with a private helipad for seamless island-hopping and executive transfers.' },
              { icon: '🌊', title: 'Unreachable Destinations', desc: 'We navigate to private islands, restricted cays, and hidden coves that no commercial cruise will ever visit.' },
              { icon: '🍾', title: 'Michelin-Level Gastronomy', desc: 'A resident Michelin-starred chef crafts bespoke menus for every meal. Every preference. Every culture. Perfected.' },
              { icon: '💎', title: 'Curated Experiences', desc: 'Submarine dives, private art viewings, emerald collection tours — each excursion is a once-in-a-lifetime event.' },
            ].map(p => (
              <div key={p.title} className="ef-pillar">
                <div className="ef-pillar__icon">{p.icon}</div>
                <h3 className="ef-pillar__title">{p.title}</h3>
                <p className="ef-pillar__desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Ships */}
      <section className="ef-section ef-section--darker">
        <div className="container">
          <div className="ef-tag">⚓ The Fleet</div>
          <h2 className="ef-heading">Meet the Ships</h2>
          <div className="ef-divider" />
          <div className="ef-ships">
            {ESCOBAR_FLEET_SHIPS.map(ship => (
              <div key={ship.id} className="ef-ship">
                <div className="ef-ship__image-wrap">
                  <img src={ship.image} alt={ship.name} className="ef-ship__image" />
                  <div className="ef-ship__image-overlay" />
                  <div className="ef-ship__image-title">{ship.name}</div>
                </div>
                <div className="ef-ship__body">
                  <div className="ef-ship__specs">
                    <div className="ef-ship__spec"><span>LENGTH</span><span>{ship.length}</span></div>
                    <div className="ef-ship__spec"><span>GUESTS</span><span>Max {ship.guests}</span></div>
                    <div className="ef-ship__spec"><span>CREW</span><span>{ship.crew} Staff</span></div>
                    <div className="ef-ship__spec"><span>BUILT</span><span>{ship.built}</span></div>
                  </div>
                  <div className="ef-ship__features">
                    {ship.features.map(f => (
                      <span key={f} className="ef-ship__feature">✦ {f}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voyages */}
      <section className="ef-section ef-section--dark">
        <div className="container">
          <div className="ef-tag">🗺 Exclusive Voyages</div>
          <h2 className="ef-heading">Available Expeditions</h2>
          <div className="ef-divider" />
          <div className="ef-voyages">
            {escobarCruises.map(c => <CruiseCard key={c.id} cruise={c} />)}
          </div>
        </div>
      </section>

      {/* Apply / Request Invitation */}
      <section id="ef-apply" className="ef-section ef-apply">
        <div className="container ef-apply__inner">
          <div className="ef-apply__content">
            <div className="ef-tag">✉ Apply</div>
            <h2 className="ef-heading">Request Your Invitation</h2>
            <div className="ef-divider" />
            <p className="ef-apply__desc">
              The Escobar Fleet accepts a very limited number of applications each season. 
              Our membership committee reviews every request personally. 
              If selected, you will receive a private call from our concierge team within 72 hours.
            </p>
            <div className="ef-apply__note">
              <span>🔒</span>
              <span>All applications are confidential and securely encrypted. Your details are never shared.</span>
            </div>
          </div>
          <form className="ef-apply__form" onSubmit={e => { e.preventDefault(); alert('Your invitation request has been received. Our team will be in touch within 72 hours.'); }}>
            <div className="form-group">
              <label className="ef-label">Full Name</label>
              <input className="ef-input" placeholder="Your full name" required />
            </div>
            <div className="form-group">
              <label className="ef-label">Email Address</label>
              <input type="email" className="ef-input" placeholder="Private email" required />
            </div>
            <div className="form-group">
              <label className="ef-label">Phone / WhatsApp</label>
              <input type="tel" className="ef-input" placeholder="+1 (000) 000-0000" required />
            </div>
            <div className="form-group">
              <label className="ef-label">Preferred Voyage</label>
              <select className="ef-input">
                {escobarCruises.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                <option value="custom">Custom Private Charter</option>
              </select>
            </div>
            <div className="form-group">
              <label className="ef-label">Message (Optional)</label>
              <textarea className="ef-input" rows={3} placeholder="Tell us about your vision for the voyage..." style={{ resize: 'vertical' }} />
            </div>
            <button type="submit" className="btn btn--gold btn--full btn--lg" style={{ marginTop: 8 }}>
              ✦ Submit Application
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
