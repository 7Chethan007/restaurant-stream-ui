import { Bike, CalendarCheck, Check, Star } from 'lucide-react';
import type { RestaurantCard } from '../types';
import { cardPhoto, formatRupees, priceBand } from '../utils/format';

export function Stars({ rating }: { rating: number | null }) {
  if (rating == null) return <span className="tw-stars tw-muted">New / unrated</span>;
  return (
    <span className="tw-stars" aria-label={`Rated ${rating} out of 5`}>
      <Star size={14} fill="currentColor" />
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
  const band = r.priceBand || priceBand(r.costForTwo);
  return (
    <article className={`tw-rcard ${focused ? 'is-focused' : ''} ${compact ? 'is-compact' : ''}`}>
      <div className="tw-rphoto" style={{ backgroundImage: `url(${cardPhoto(r.id)})` }} aria-hidden="true">
        {rank != null && <span className="tw-rank">{rank}</span>}
        <span className="tw-band">{band}</span>
      </div>

      <div className="tw-rbody">
        <div className="tw-rtop">
          <div>
            <h4>{r.name}</h4>
            <p className="tw-muted">{r.location}{r.restType ? ` · ${r.restType}` : ''}</p>
          </div>
          <div className="tw-rmeta">
            <Stars rating={r.rating} />
            {r.votes > 0 && <span className="tw-muted">{r.votes.toLocaleString('en-IN')} votes</span>}
          </div>
        </div>

        <div className="tw-rrow">
          <span className="tw-price">{formatRupees(r.costForTwo)} <span className="tw-muted">for two</span></span>
          {r.onlineOrder && <span className="tw-badge"><Bike size={12} /> Delivery</span>}
          {r.bookTable && <span className="tw-badge"><CalendarCheck size={12} /> Booking</span>}
        </div>

        {!compact && r.cuisines.length > 0 && <p className="tw-cuisines">{r.cuisines.slice(0, 4).join(' · ')}</p>}

        {!compact && r.matchedOn.length > 0 && (
          <div className="tw-why">
            {r.matchedOn.map((m) => <span key={m} className="tw-chip is-soft">{m}</span>)}
          </div>
        )}

        {onChoose && (
          <button type="button" className={`tw-btn tw-btn-sm ${focused ? 'tw-btn-full' : 'tw-btn-ghost'}`} onClick={() => onChoose(r.id)}>
            {focused ? <><Check size={14} /> Chosen</> : 'Choose this place'}
          </button>
        )}
      </div>
    </article>
  );
}
