import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import './CruiseCard.css';

export default function CruiseCard({ cruise, showEscobarBadge = true }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const inWishlist = state.wishlist.some(c => c.id === cruise.id);
  const discount = Math.round(((cruise.originalPrice - cruise.priceFrom) / cruise.originalPrice) * 100);

  const handleWishlist = (e) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_WISHLIST', payload: cruise });
  };

  const handleClick = () => {
    dispatch({ type: 'SET_SELECTED_CRUISE', payload: cruise });
    navigate(`/cruise/${cruise.id}`);
  };

  return (
    <div className={`cruise-card ${cruise.isEscobar ? 'cruise-card--escobar' : ''}`} onClick={handleClick}>
      <div className="cruise-card__image-wrap">
        <img src={cruise.image} alt={cruise.name} className="cruise-card__image" loading="lazy" />
        <div className="cruise-card__overlay" />

        <div className="cruise-card__top">
          <span className={`badge ${cruise.isEscobar ? 'badge--gold' : 'badge--accent'}`}>
            {cruise.badge}
          </span>
          <button
            className={`cruise-card__wishlist ${inWishlist ? 'active' : ''}`}
            onClick={handleWishlist}
            title={inWishlist ? 'Remove from wishlist' : 'Save'}
          >
            {inWishlist ? '♥' : '♡'}
          </button>
        </div>

        <div className="cruise-card__bottom">
          <div className="cruise-card__ship">
            {cruise.isEscobar ? '⚓' : '🚢'} {cruise.ship}
          </div>
        </div>
      </div>

      <div className="cruise-card__body">
        <div className="cruise-card__meta">
          <span className="cruise-card__duration">⏱ {cruise.duration} nights</span>
          <div className="cruise-card__rating">
            <span className="star">★</span>
            <span>{cruise.rating}</span>
            <span className="cruise-card__reviews">({cruise.reviewCount.toLocaleString()})</span>
          </div>
        </div>

        <h3 className="cruise-card__title">{cruise.name}</h3>
        <p className="cruise-card__itinerary">
          {cruise.itinerary.slice(0, 3).join(' → ')} {cruise.itinerary.length > 3 && `+${cruise.itinerary.length - 3} more`}
        </p>

        <div className="cruise-card__footer">
          <div className="cruise-card__price">
            {discount > 0 && <span className="cruise-card__original">${cruise.originalPrice.toLocaleString()}</span>}
            <div className="cruise-card__price-main">
              <span className="cruise-card__from">From</span>
              <span className={`cruise-card__amount ${cruise.isEscobar ? 'cruise-card__amount--gold' : ''}`}>
                ${cruise.priceFrom.toLocaleString()}
              </span>
              <span className="cruise-card__per">/ person</span>
            </div>
            {discount > 0 && <span className="cruise-card__save">Save {discount}%</span>}
          </div>
          <button className={`btn btn--sm ${cruise.isEscobar ? 'btn--gold' : 'btn--primary'}`}>
            {cruise.isEscobar ? 'Request Access' : 'View Deal'}
          </button>
        </div>
      </div>
    </div>
  );
}
