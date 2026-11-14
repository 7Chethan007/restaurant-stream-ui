/** Answer drawer for RESTAURANT_ANSWER events: the "inside the chosen cafe" view. */
import { Bike, CalendarCheck, ExternalLink, MapPin, Phone, X } from 'lucide-react';
import type { Answer, RestaurantCard } from '../types';
import { formatRupees } from '../utils/format';
import { Stars } from './RestaurantCardView';

interface Props {
  restaurant: RestaurantCard;
  answer: Answer | null | undefined;
  onClose: () => void;
}

export function RestaurantDetail({ restaurant: r, answer, onClose }: Props) {
  return (
    <aside className="drawer" role="dialog" aria-label={`${r.name} details`}>
      <header className="drawer-hero">
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close details"><X size={18} /></button>
        <span className="eyebrow light">{r.location} · {r.restType}</span>
        <h2>{r.name}</h2>
        <div className="drawer-hero-meta">
          <Stars rating={r.rating} />
          <span>{formatRupees(r.costForTwo)} for two</span>
          <span className="band">{r.priceBand}</span>
        </div>
      </header>

      <div className="drawer-body">
        {answer && (
          <section className="answer">
            <span className="eyebrow">{answer.intent.toLowerCase()}</span>
            <p className="answer-text">{answer.text}</p>
            {answer.facts.length > 0 && (
              <dl className="facts">
                {answer.facts.map((f) => (
                  <div key={f.label} className="fact"><dt>{f.label}</dt><dd>{f.value}</dd></div>
                ))}
              </dl>
            )}
          </section>
        )}

        <section>
          <h4>On the menu</h4>
          {r.menuPreview.length > 0 ? (
            <div className="chips-wrap">
              {r.menuPreview.map((m) => <span key={m} className="chip">{m}</span>)}
              {r.menuCount > r.menuPreview.length && <span className="chip chip-soft">+{r.menuCount - r.menuPreview.length} more</span>}
            </div>
          ) : r.dishesLiked.length > 0 ? (
            <div className="chips-wrap">{r.dishesLiked.map((d) => <span key={d} className="chip">{d}</span>)}</div>
          ) : <p className="muted small">No menu listed for this place.</p>}
          <p className="honest-note">Zomato data lists dish names only — no per-dish prices. Cost for two is the best price signal.</p>
        </section>

        {r.topReviews.length > 0 && (
          <section>
            <h4>What people say</h4>
            <ul className="reviews">
              {r.topReviews.map((rv, i) => (
                <li key={i}><Stars rating={rv.rating} /><p>{rv.text}</p></li>
              ))}
            </ul>
          </section>
        )}

        <section className="badges-row">
          <span className={`badge ${r.onlineOrder ? '' : 'is-off'}`}><Bike size={12} /> {r.onlineOrder ? 'Delivers online' : 'No online orders'}</span>
          <span className={`badge ${r.bookTable ? '' : 'is-off'}`}><CalendarCheck size={12} /> {r.bookTable ? 'Table booking' : 'No booking'}</span>
        </section>

        <section className="contact">
          <p><MapPin size={14} /> {r.address}</p>
          {r.phone && <p><Phone size={14} /> {r.phone.split(/\r?\n/).join(' · ')}</p>}
          {r.url && <a href={r.url} target="_blank" rel="noreferrer noopener"><ExternalLink size={14} /> View on Zomato</a>}
        </section>
      </div>
    </aside>
  );
}
