import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import CruiseCard from '../../components/CruiseCard/CruiseCard';
import './WishlistPage.css';

export default function WishlistPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { wishlist } = state;

  return (
    <div className="wishlist-page" style={{ paddingTop: 'calc(var(--header-height) + 40px)', paddingBottom: 80 }}>
      <div className="container">
        <div className="wishlist-header">
          <h1 className="section-heading">My Wishlist ♡</h1>
          <p style={{ color: 'var(--text-body)', marginTop: 8 }}>
            {wishlist.length > 0
              ? `${wishlist.length} saved cruise${wishlist.length !== 1 ? 's' : ''} — ready when you are.`
              : 'You haven\'t saved any cruises yet.'
            }
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty__icon">♡</div>
            <h2>Your wishlist is empty</h2>
            <p>Browse our cruises and tap the heart icon to save your favorites here.</p>
            <button className="btn btn--primary btn--lg" onClick={() => navigate('/search')}>
              Browse Cruises →
            </button>
          </div>
        ) : (
          <>
            <div className="wishlist-grid">
              {wishlist.map(c => <CruiseCard key={c.id} cruise={c} />)}
            </div>
            <div className="wishlist-actions">
              <button className="btn btn--outline" onClick={() => dispatch({ type: 'RESET_BOOKING' })}>
                Clear All
              </button>
              <button className="btn btn--accent btn--lg" onClick={() => navigate('/search')}>
                Find More Cruises →
              </button>
            </div>
          </>
        )}

        {state.recentlyViewed.length > 0 && (
          <div className="wishlist-recent">
            <h2 className="section-heading" style={{ fontSize: 24 }}>Recently Viewed</h2>
            <div className="divider" />
            <div className="wishlist-grid">
              {state.recentlyViewed.slice(0, 4).map(c => <CruiseCard key={c.id} cruise={c} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
