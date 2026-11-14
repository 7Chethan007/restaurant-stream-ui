/** Answer drawer for RESTAURANT_ANSWER events: the "inside the chosen cafe" view. */
import { Bike, CalendarCheck, ExternalLink, MapPin, Phone, X } from 'lucide-react';
import type { Answer, RestaurantCard } from '../types';
import { cardPhoto, formatRupees } from '../utils/format';
import { Stars } from './RestaurantCardView';

interface Props {
  restaurant: RestaurantCard;
  answer: Answer | null | undefined;
  onClose: () => void;
}

export function RestaurantDetail({ restaurant: r, answer, onClose }: Props) {
  return (
    <aside className="tw-drawer" role="dialog" aria-label={`${r.name} details`}>
      <header className="tw-drawer-hero" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.75)), url(${cardPhoto(r.id)})` }}>
        <button type="button" className="tw-icon-btn" onClick={onClose} aria-label="Close details"><X size={18} /></button>
        <span className="tw-eyebrow is-light">{r.location} · {r.restType}</span>
        <h2>{r.name}</h2>
        <div className="tw-drawer-meta">
          <Stars rating={r.rating} />
          <span>{formatRupees(r.costForTwo)} for two</span>
          <span className="tw-band-inline">{r.priceBand}</span>
        </div>
      </header>

      <div className="tw-drawer-body">
        {answer && (
          <section className="tw-answer">
            <span className="tw-eyebrow">{answer.intent.toLowerCase()}</span>
            <p className="tw-answer-text">{answer.text}</p>
            {answer.facts.length > 0 && (
              <dl className="tw-facts">
                {answer.facts.map((f) => (
                  <div key={f.label} className="tw-fact"><dt>{f.label}</dt><dd>{f.value}</dd></div>
                ))}
              </dl>
            )}
          </section>
        )}

        <section>
          <h4 className="tw-subhead">On the menu</h4>
          {r.menuPreview.length > 0 ? (
            <div className="tw-chips">
              {r.menuPreview.map((m) => <span key={m} className="tw-chip">{m}</span>)}
              {r.menuCount > r.menuPreview.length && <span className="tw-chip is-soft">+{r.menuCount - r.menuPreview.length} more</span>}
            </div>
          ) : r.dishesLiked.length > 0 ? (
            <div className="tw-chips">{r.dishesLiked.map((d) => <span key={d} className="tw-chip">{d}</span>)}</div>
          ) : <p className="tw-muted">No menu listed for this place.</p>}
          <p className="tw-note">Zomato data lists dish names only — no per-dish prices. Cost for two is the best price signal.</p>
        </section>

        {r.topReviews.length > 0 && (
          <section>
            <h4 className="tw-subhead">What people say</h4>
            <ul className="tw-reviews">
              {r.topReviews.map((rv, i) => (
                <li key={i}><Stars rating={rv.rating} /><p>{rv.text}</p></li>
              ))}
            </ul>
          </section>
        )}

        <section className="tw-badges">
          <span className={`tw-badge ${r.onlineOrder ? '' : 'is-off'}`}><Bike size={12} /> {r.onlineOrder ? 'Delivers online' : 'No online orders'}</span>
          <span className={`tw-badge ${r.bookTable ? '' : 'is-off'}`}><CalendarCheck size={12} /> {r.bookTable ? 'Table booking' : 'No booking'}</span>
        </section>

        <section className="tw-contact">
          <p><MapPin size={14} /> {r.address}</p>
          {r.phone && <p><Phone size={14} /> {r.phone.split(/\r?\n/).join(' · ')}</p>}
          {r.url && <a href={r.url} target="_blank" rel="noreferrer noopener"><ExternalLink size={14} /> View on Zomato</a>}
        </section>
      </div>
    </aside>
  );
}
