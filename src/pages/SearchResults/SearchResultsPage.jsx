import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { CRUISES, DESTINATIONS, DEPARTURE_PORTS } from '../../data/cruises';
import CruiseCard from '../../components/CruiseCard/CruiseCard';
import BookingWidget from '../../components/BookingWidget/BookingWidget';
import './SearchResultsPage.css';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'duration-asc', label: 'Shortest First' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function SearchResultsPage() {
  const { state } = useApp();
  const [searchParams] = useSearchParams();
  const [sort, setSort] = useState('popular');
  const [filterDest, setFilterDest] = useState(searchParams.get('destination') || state.search.destination || '');
  const [filterPort, setFilterPort] = useState(state.search.departurePort || '');
  const [filterDuration, setFilterDuration] = useState('');
  const [filterPrice, setFilterPrice] = useState('');
  const [filterEscobar, setFilterEscobar] = useState(false);

  // Re-sync filters whenever the user submits a new search from the widget
  useEffect(() => {
    setFilterDest(state.search.destination || '');
    setFilterPort(state.search.departurePort || '');
  }, [state.search.destination, state.search.departurePort]);

  const { standardResults, escobarResults, isFallback, fallbackMsg } = useMemo(() => {
    const sorted = (arr) => {
      const copy = [...arr];
      switch (sort) {
        case 'price-asc': return copy.sort((a, b) => a.priceFrom - b.priceFrom);
        case 'price-desc': return copy.sort((a, b) => b.priceFrom - a.priceFrom);
        case 'duration-asc': return copy.sort((a, b) => a.duration - b.duration);
        case 'rating': return copy.sort((a, b) => b.rating - a.rating);
        default: return copy.sort((a, b) => b.reviewCount - a.reviewCount);
      }
    };

    const applySecondary = (list) => {
      let out = [...list];
      if (filterDuration === '7') out = out.filter(c => c.duration <= 7);
      else if (filterDuration === '14') out = out.filter(c => c.duration > 7 && c.duration <= 14);
      else if (filterDuration === '15') out = out.filter(c => c.duration > 14);
      if (filterPrice === '1000') out = out.filter(c => c.priceFrom <= 1000);
      else if (filterPrice === '3000') out = out.filter(c => c.priceFrom <= 3000);
      else if (filterPrice === '9999') out = out.filter(c => c.priceFrom > 3000);
      return out;
    };

    const allStandard = CRUISES.filter(c => !c.isEscobar);
    const allEscobar = CRUISES.filter(c => c.isEscobar);

    // Attempt 1 — exact match: destination + port + secondary filters
    let strict = [...allStandard];
    if (filterDest) strict = strict.filter(c => c.destination === filterDest);
    if (filterPort) strict = strict.filter(c => c.departsFrom === filterPort);
    strict = applySecondary(strict);
    if (strict.length > 0) {
      return { standardResults: sorted(strict), escobarResults: sorted(allEscobar.filter(c => !filterDest || c.destination === filterDest)), isFallback: false, fallbackMsg: '' };
    }

    // Attempt 2 — relax port only (keep destination + secondary)
    if (filterPort) {
      let noPort = [...allStandard];
      if (filterDest) noPort = noPort.filter(c => c.destination === filterDest);
      noPort = applySecondary(noPort);
      if (noPort.length > 0) {
        const destName = DESTINATIONS.find(d => d.id === filterDest)?.name;
        return {
          standardResults: sorted(noPort),
          escobarResults: sorted(allEscobar.filter(c => !filterDest || c.destination === filterDest)),
          isFallback: true,
          fallbackMsg: `No cruises depart from ${filterPort}${destName ? ` to ${destName}` : ''}. Showing similar cruises instead.`,
        };
      }
    }

    // Attempt 3 — relax destination + port, keep secondary filters only
    if (filterDest || filterPort) {
      const secondary = applySecondary([...allStandard]);
      if (secondary.length > 0) {
        return {
          standardResults: sorted(secondary),
          escobarResults: sorted(allEscobar),
          isFallback: true,
          fallbackMsg: 'No exact match found. Showing all cruises that match your other filters.',
        };
      }
    }

    // Attempt 4 — show everything (all filters relaxed)
    return {
      standardResults: sorted([...allStandard]),
      escobarResults: sorted(allEscobar),
      isFallback: true,
      fallbackMsg: 'No exact match found. Here are all our available cruises.',
    };
  }, [filterDest, filterPort, filterDuration, filterPrice, filterEscobar, sort]);

  return (
    <div className="search-results" style={{ paddingTop: 'calc(var(--header-height) + 36px)' }}>
      {/* Widget */}
      <div className="sr__widget-bar">
        <div className="container">
          <BookingWidget variant="inline" />
        </div>
      </div>

      <div className="container sr__body">
        {/* Filters */}
        <aside className="sr__filters">
          <h3 className="sr__filter-heading">Filter Results</h3>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Destination</label>
            <select className="form-select" value={filterDest} onChange={e => setFilterDest(e.target.value)}>
              <option value="">All Destinations</option>
              {DESTINATIONS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Departure Port</label>
            <select className="form-select" value={filterPort} onChange={e => setFilterPort(e.target.value)}>
              <option value="">Any Port</option>
              {DEPARTURE_PORTS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Duration</label>
            <select className="form-select" value={filterDuration} onChange={e => setFilterDuration(e.target.value)}>
              <option value="">Any</option>
              <option value="7">Up to 7 nights</option>
              <option value="14">8–14 nights</option>
              <option value="15">15+ nights</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Price Range</label>
            <select className="form-select" value={filterPrice} onChange={e => setFilterPrice(e.target.value)}>
              <option value="">Any Budget</option>
              <option value="1000">Under $1,000</option>
              <option value="3000">$1,000 – $3,000</option>
              <option value="9999">Premium ($3,000+)</option>
            </select>
          </div>

          <div className="sr__vip-toggle" onClick={() => setFilterEscobar(v => !v)} style={{ borderColor: filterEscobar ? 'var(--gold)' : '' }}>
            <span className="sr__vip-icon">✦</span>
            <div>
              <div className="sr__vip-label">Escobar Fleet</div>
              <div className="sr__vip-sub">Show VIP exclusive cruises</div>
            </div>
            <div className={`sr__vip-check ${filterEscobar ? 'active' : ''}`}>{filterEscobar ? '✓' : ''}</div>
          </div>

          <button className="btn btn--outline btn--full" style={{ marginTop: 16 }}
            onClick={() => { setFilterDest(''); setFilterPort(''); setFilterDuration(''); setFilterPrice(''); setFilterEscobar(false); }}>
            Clear Filters
          </button>
        </aside>

        {/* Results */}
        <div className="sr__results">
          <div className="sr__results-header">
            <div className="sr__count">
              <strong>{standardResults.length}</strong> cruise{standardResults.length !== 1 ? 's' : ''} found
              {filterDest && ` to ${DESTINATIONS.find(d => d.id === filterDest)?.name || filterDest}`}
              {filterPort && ` from ${filterPort}`}
            </div>
            <div className="sr__sort">
              <label className="form-label" style={{ whiteSpace: 'nowrap' }}>Sort by:</label>
              <select className="form-select" style={{ width: 'auto' }} value={sort} onChange={e => setSort(e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {isFallback && fallbackMsg && (
            <div className="sr__fallback-banner">
              <span>🔍</span>
              <span>{fallbackMsg}</span>
            </div>
          )}

          <div className="sr__grid">
            {standardResults.map(c => <CruiseCard key={c.id} cruise={c} />)}
          </div>

          {filterEscobar && escobarResults.length > 0 && (
            <div className="sr__escobar-section">
              <div className="sr__escobar-header">
                <span>✦</span>
                <div>
                  <div className="sr__escobar-title">Escobar Fleet — Exclusive Voyages</div>
                  <div className="sr__escobar-sub">For a select few. Discretion guaranteed.</div>
                </div>
              </div>
              <div className="sr__grid">
                {escobarResults.map(c => <CruiseCard key={c.id} cruise={c} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
