import { Link, useNavigate } from 'react-router-dom';
import './Footer.css';

const FOOTER_LINKS = {
  'Explore': [
    { label: 'All Destinations', path: '/destinations' },
    { label: 'Caribbean Cruises', path: '/search?destination=caribbean' },
    { label: 'Mediterranean Cruises', path: '/search?destination=mediterranean' },
    { label: 'Alaska Cruises', path: '/search?destination=alaska' },
    { label: 'Northern Europe', path: '/search?destination=northern-europe' },
    { label: 'Escobar Fleet (VIP)', path: '/escobar-fleet' },
  ],
  'Plan': [
    { label: 'Search Cruises', path: '/search' },
    { label: 'My Wishlist', path: '/wishlist' },
    { label: 'Onboard Experience', path: '/search' },
    { label: 'Dining & Entertainment', path: '/search' },
    { label: 'Shore Excursions', path: '/search' },
    { label: 'Travel Insurance', path: '/search' },
  ],
  'Company': [
    { label: 'About Pablo Cruises', path: '/' },
    { label: 'Our Fleet', path: '/search' },
    { label: 'Sustainability', path: '/' },
    { label: 'Careers', path: '/' },
    { label: 'Press Room', path: '/' },
    { label: 'Contact Us', path: '/' },
  ],
  'Support': [
    { label: 'Help Center', path: '/' },
    { label: 'Accessibility', path: '/' },
    { label: 'Cookie Preferences', path: '/' },
    { label: 'Privacy Policy', path: '/' },
    { label: 'Terms & Conditions', path: '/' },
    { label: 'Sitemap', path: '/' },
  ],
};

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="footer">
      {/* Newsletter */}
      <div className="footer__newsletter">
        <div className="container footer__newsletter-inner">
          <div>
            <h3 className="footer__nl-title">Exclusive Deals, Direct to You</h3>
            <p className="footer__nl-sub">Join 2 million+ travelers and never miss a deal again.</p>
          </div>
          <form className="footer__nl-form" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Your email address" className="footer__nl-input" />
            <button type="submit" className="btn btn--accent">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer__main">
        <div className="container">
          <div className="footer__grid">
            {/* Brand */}
            <div className="footer__brand">
              <div className="footer__logo">
                <span className="footer__logo-icon">⚓</span>
                <span className="footer__logo-name">Pablo Cruises</span>
              </div>
              <p className="footer__brand-desc">
                Setting sail since 2020, Pablo Cruises offers world-class voyages 
                across all seven seas — from family adventures to the legendary Escobar Fleet VIP experience.
              </p>
              <div className="footer__socials">
                <a href="#" className="footer__social">𝕏</a>
                <a href="#" className="footer__social">in</a>
                <a href="#" className="footer__social">f</a>
                <a href="#" className="footer__social">📸</a>
              </div>
              <div className="footer__trust">
                <span>🏆 #1 Rated Cruise Line 2025</span>
                <span>🔒 Secure Booking</span>
                <span>✈ IATA Certified</span>
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
              <div key={heading} className="footer__col">
                <h4 className="footer__col-heading">{heading}</h4>
                <ul className="footer__col-links">
                  {links.map(l => (
                    <li key={l.label}>
                      <Link to={l.path} className="footer__link">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Escobar Fleet Strip */}
      <div className="footer__vip-strip" onClick={() => navigate('/escobar-fleet')}>
        <div className="container footer__vip-inner">
          <span className="footer__vip-text">✦ Discover the Legendary Escobar Fleet — VIP Access Only</span>
          <span className="footer__vip-cta">Request Invitation →</span>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {new Date().getFullYear()} Pablo Cruises. All rights reserved. For research purposes only.</p>
          <div className="footer__payments">
            <span className="footer__pay">VISA</span>
            <span className="footer__pay">MC</span>
            <span className="footer__pay">AMEX</span>
            <span className="footer__pay">PayPal</span>
            <span className="footer__pay">🔒 SSL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
