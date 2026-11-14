import { Bike, CalendarCheck, Check, Star } from 'lucide-react';
import type { RestaurantCard } from '../types';
import { formatRupees, priceBand } from '../utils/format';

export function Stars({ rating }: { rating: number | null }) {
  if (rating == null) return <span className="stars muted small">New / unrated</span>;
  return (
    <span className="stars" aria-label={`Rated ${rating} out of 5`}>
      <Star size={14} className="star-icon" fill="currentColor" />
      <b>{rating.toFixed(1)}</b>
    </span>
  );
}

interface Props {
  r: RestaurantCard;
  rank?: number;
  focused?: boolean;
  onChoose?: (id: string) => void;
  compact?: boolean;
}

export function RestaurantCardView({ r, rank, focused, onChoose, compact }: Props) {
  return (
    <article className={`r-card ${focused ? 'is-focused' : ''} ${compact ? 'is-compact' : ''}`}>
      <div className="r-card-top">
        {rank != null && <span className="rank">{rank}</span>}
        <div className="r-card-title">
          <h3>{r.name}</h3>
          <p className="muted small">{r.location}{r.restType ? ` · ${r.restType}` : ''}</p>
        </div>
        <div className="r-card-meta">
          <Stars rating={r.rating} />
          {r.votes > 0 && <span className="muted tiny">{r.votes.toLocaleString('en-IN')} votes</span>}
        </div>
      </div>

      <div className="r-card-row">
        <span className="price">{formatRupees(r.costForTwo)} <span className="muted small">for two</span></span>
        <span className="band" title="Price band">{r.priceBand || priceBand(r.costForTwo)}</span>
        {r.onlineOrder && <span className="badge"><Bike size={12} /> Delivery</span>}
        {r.bookTable && <span className="badge"><CalendarCheck size={12} /> Table booking</span>}
      </div>

      {!compact && r.cuisines.length > 0 && <p className="cuisines">{r.cuisines.slice(0, 4).join(' · ')}</p>}

      {r.matchedOn.length > 0 && (
        <div className="why">
          <span className="eyebrow">Why this</span>
          {r.matchedOn.map((m) => <span key={m} className="chip chip-soft">{m}</span>)}
        </div>
      )}

      {onChoose && (
        <button type="button" className={`btn ${focused ? 'btn-chosen' : 'btn-outline'} btn-sm`} onClick={() => onChoose(r.id)}>
          {focused ? <><Check size={14} /> Chosen</> : 'Choose this place'}
        </button>
      )}
    </article>
  );
}
