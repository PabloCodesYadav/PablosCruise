import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import './Header.css';

const NAV_LINKS = [
  { label: 'Destinations', path: '/destinations' },
  { label: 'Cruises', path: '/search' },
  { label: 'Deals', path: '/search?deals=true' },
];

export default function Header() {
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isEscobarPage = location.pathname === '/escobar-fleet';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const wishlistCount = state.wishlist.length;

  return (
    <header className={`header ${scrolled || isEscobarPage ? 'header--scrolled' : ''} ${isEscobarPage ? 'header--escobar' : ''}`}>
      <div className="header__top">
        <div className="container header__top-inner">
          <span>✈ Free Cancellation on Select Sailings</span>
          <div className="header__top-right">
            <span>📞 1-800-PABLO-GO</span>
            <span>|</span>
            <span>🌎 USD</span>
          </div>
        </div>
      </div>

      <div className="header__main">
        <div className="container header__inner">
          {/* Logo */}
          <Link to="/" className="header__logo">
            <div className="header__logo-icon">⚓</div>
            <div className="header__logo-text">
              <span className="header__logo-name">Pablo Cruises</span>
              <span className="header__logo-tagline">Sail the Legend</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="header__nav">
            {NAV_LINKS.map(l => (
              <Link
                key={l.path}
                to={l.path}
                className={`header__nav-link ${location.pathname === l.path ? 'active' : ''}`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/escobar-fleet"
              className={`header__nav-link header__nav-link--vip ${location.pathname === '/escobar-fleet' ? 'active' : ''}`}
            >
              ✦ Escobar Fleet
            </Link>
          </nav>

          {/* Actions */}
          <div className="header__actions">
            <button
              className="header__icon-btn"
              onClick={() => navigate('/wishlist')}
              title="Wishlist"
            >
              ♡ {wishlistCount > 0 && <span className="header__badge">{wishlistCount}</span>}
            </button>
            <button className="btn btn--accent btn--sm" onClick={() => navigate('/search')}>
              Book Now
            </button>
            <button
              className="header__hamburger"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="header__mobile">
          {NAV_LINKS.map(l => (
            <Link key={l.path} to={l.path} className="header__mobile-link">{l.label}</Link>
          ))}
          <Link to="/escobar-fleet" className="header__mobile-link header__mobile-link--vip">
            ✦ Escobar Fleet (VIP)
          </Link>
          <Link to="/wishlist" className="header__mobile-link">♡ Wishlist ({wishlistCount})</Link>
          <button className="btn btn--accent btn--full" onClick={() => navigate('/search')}>
            Book Now
          </button>
        </div>
      )}
    </header>
  );
}
