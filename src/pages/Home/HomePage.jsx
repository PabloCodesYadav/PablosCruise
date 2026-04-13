import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingWidget from '../../components/BookingWidget/BookingWidget';
import CruiseCard from '../../components/CruiseCard/CruiseCard';
import { CRUISES, DESTINATIONS } from '../../data/cruises';
import './HomePage.css';

const STATS = [
  { value: '2M+', label: 'Happy Sailors' },
  { value: '80+', label: 'Destinations' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '15', label: 'Ships in Fleet' },
];

const WHY = [
  { icon: '🏆', title: 'Best Price Guarantee', desc: 'Find a lower price and we\'ll match it — no questions asked.' },
  { icon: '🔄', title: 'Free Cancellation', desc: 'Change your plans up to 48 hours before sailing, completely free.' },
  { icon: '🍽️', title: 'All-Inclusive Dining', desc: 'World-class cuisine at every port and on every Pablo ship.' },
  { icon: '🎭', title: 'Nightly Entertainment', desc: 'Broadway-style shows, live music, and themed evenings every night at sea.' },
  { icon: '🏊', title: 'Premium Amenities', desc: 'Multiple pools, spas, gyms, and kid zones included in your fare.' },
  { icon: '⚓', title: 'Experienced Crew', desc: 'Award-winning hospitality staff with a minimum 10 years of experience.' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [heroSlide, setHeroSlide] = useState(0);

  const HERO_SLIDES = [
    { image: '/hero_cruise.png', headline: 'The World Is Yours.', sub: 'Set sail on award-winning voyages to over 80 destinations worldwide.' },
    { image: '/mediterranean.png', headline: 'Discover the Mediterranean.', sub: 'Ancient harbors, sun-drenched coasts, and flavors that last a lifetime.' },
    { image: '/caribbean.png', headline: 'Caribbean Awaits.', sub: 'Turquoise waters, white sands, and pure freedom — starting from $799.' },
  ];

  useEffect(() => {
    const t = setInterval(() => setHeroSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const featuredCruises = CRUISES.filter(c => !c.isEscobar).slice(0, 4);
  const escobarCruises = CRUISES.filter(c => c.isEscobar);

  return (
    <div className="home">
      {/* ── Hero ── */}
      <section className="hero">
        {HERO_SLIDES.map((slide, i) => (
          <div key={i} className={`hero__slide ${i === heroSlide ? 'active' : ''}`}>
            <img src={slide.image} alt="cruise hero" className="hero__bg" />
            <div className="hero__overlay" />
          </div>
        ))}

        <div className="hero__dots">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} className={`hero__dot ${i === heroSlide ? 'active' : ''}`} onClick={() => setHeroSlide(i)} />
          ))}
        </div>

        <div className="hero__content container">
          <div className="hero__promo-tag">🔥 Summer Sale — Up to 40% Off</div>
          <h1 className="hero__headline">{HERO_SLIDES[heroSlide].headline}</h1>
          <p className="hero__sub">{HERO_SLIDES[heroSlide].sub}</p>
          <div className="hero__actions">
            <button className="btn btn--accent btn--lg" onClick={() => navigate('/search')}>Explore All Cruises</button>
            <button className="btn btn--ghost btn--lg" onClick={() => navigate('/destinations')}>View Destinations</button>
          </div>
        </div>

        <div className="hero__widget-wrap container">
          <BookingWidget variant="hero" />
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats">
        <div className="container stats__grid">
          {STATS.map(s => (
            <div key={s.label} className="stats__item">
              <div className="stats__value">{s.value}</div>
              <div className="stats__label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Destinations ── */}
      <section className="section">
        <div className="container">
          <div className="section-tag">🌍 Explore the World</div>
          <h2 className="section-heading">Popular Destinations</h2>
          <div className="divider" />
          <div className="destinations__grid">
            {DESTINATIONS.slice(0, 6).map(d => (
              <div
                key={d.id}
                className="dest-card"
                onClick={() => navigate(`/search?destination=${d.id}`)}
              >
                <img src={d.image} alt={d.name} className="dest-card__image" />
                <div className="dest-card__overlay" />
                <div className="dest-card__content">
                  <div className="dest-card__flag">{d.flag}</div>
                  <h3 className="dest-card__name">{d.name}</h3>
                  <p className="dest-card__tagline">{d.tagline}</p>
                </div>
                {d.popular && <span className="dest-card__popular">Popular</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Cruises ── */}
      <section className="section" style={{ background: 'var(--off-white)', marginTop: 0, paddingTop: 64 }}>
        <div className="container">
          <div className="section-tag">⚓ Hand-Picked Voyages</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 className="section-heading">Featured Cruises</h2>
              <div className="divider" />
            </div>
            <button className="btn btn--outline" onClick={() => navigate('/search')}>View All Cruises →</button>
          </div>
          <div className="cruises-grid">
            {featuredCruises.map(c => <CruiseCard key={c.id} cruise={c} />)}
          </div>
        </div>
      </section>

      {/* ── Escobar Fleet Teaser ── */}
      <section className="escobar-teaser">
        <div className="escobar-teaser__bg">
          <img src="/escobar_fleet.png" alt="Escobar Fleet" className="escobar-teaser__image" />
          <div className="escobar-teaser__overlay" />
        </div>
        <div className="container escobar-teaser__content">
          <div className="escobar-teaser__left">
            <div className="section-tag section-tag--gold">✦ Exclusively Yours</div>
            <h2 className="section-heading section-heading--white" style={{ fontFamily: "'Cinzel', serif" }}>
              The Escobar Fleet
            </h2>
            <div className="divider divider--gold" />
            <p className="section-sub section-sub--white">
              For those who desire more than luxury — an exclusive collection of 
              private mega-yachts that redefine what it means to sail. 
              Invitation only. Absolute discretion guaranteed.
            </p>
            <div className="escobar-teaser__features">
              {['100% Private Itineraries', 'Personal Chef & Butler', 'Helicopter Excursions', 'Zero Digital Footprint'].map(f => (
                <div key={f} className="escobar-teaser__feature">
                  <span className="escobar-teaser__check">✦</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 32 }}>
              <button className="btn btn--gold btn--lg" onClick={() => navigate('/escobar-fleet')}>
                Discover the Fleet
              </button>
              <button className="btn btn--outline-gold btn--lg" onClick={() => navigate('/escobar-fleet')}>
                Request Invitation
              </button>
            </div>
          </div>

          <div className="escobar-teaser__cards">
            {escobarCruises.map(c => <CruiseCard key={c.id} cruise={c} />)}
          </div>
        </div>
      </section>

      {/* ── Why Pablo ── */}
      <section className="section">
        <div className="container">
          <div className="section-tag">💎 The Pablo Difference</div>
          <h2 className="section-heading">Why Choose Pablo Cruises</h2>
          <div className="divider" />
          <div className="why-grid">
            {WHY.map(w => (
              <div key={w.title} className="why-card">
                <div className="why-card__icon">{w.icon}</div>
                <h4 className="why-card__title">{w.title}</h4>
                <p className="why-card__desc">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section" style={{ background: 'var(--navy-dark)', marginTop: 0 }}>
        <div className="container">
          <div className="section-tag" style={{ color: 'var(--sky)' }}>💬 What Sailors Say</div>
          <h2 className="section-heading section-heading--white">Real Experiences</h2>
          <div className="divider" />
          <div className="testimonials-grid">
            {[
              { name: 'Sarah M.', location: 'New York', rating: 5, text: 'The Mediterranean cruise was absolutely life-changing. The crew was incredible and every port was magical. Pablo Cruises surpassed every expectation!', cruise: 'Mediterranean Odyssey' },
              { name: 'James R.', location: 'Miami', rating: 5, text: 'Best vacation of my life. The food, the service, the entertainment — all flawless. We only booked a 7-night Caribbean and now we\'re already planning our next trip.', cruise: 'Caribbean Paradise' },
              { name: 'Elena V.', location: 'London', rating: 5, text: 'The Norwegian fjords cruise was breathtaking. Waking up to glaciers right outside your balcony is something you never forget. Highly recommend!', cruise: 'Scandinavian Legends' },
            ].map(t => (
              <div key={t.name} className="testimonial-card">
                <div className="stars">
                  {Array.from({ length: t.rating }).map((_, i) => <span key={i} className="star">★</span>)}
                </div>
                <p className="testimonial-card__text">"{t.text}"</p>
                <div className="testimonial-card__author">
                  <div className="testimonial-card__avatar">{t.name[0]}</div>
                  <div>
                    <div className="testimonial-card__name">{t.name}</div>
                    <div className="testimonial-card__meta">{t.location} · {t.cruise}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
