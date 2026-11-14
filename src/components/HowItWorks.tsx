import { Ear, Radio, Sparkles } from 'lucide-react';

const STEPS = [
  { icon: Ear, title: 'Just talk', text: 'Press Start listening and chat with a friend. Every finished sentence is streamed out as it happens.' },
  { icon: Radio, title: 'Flink keeps the thread', text: 'A Flink job keyed by your session remembers the area, dish, budget and chosen place for the whole conversation.' },
  { icon: Sparkles, title: 'Suggestions pop up', text: 'Matches from 12,000+ Bangalore restaurants appear the moment they exist. Then ask about price, menu or reviews.' },
];

export function HowItWorks() {
  return (
    <section id="how" className="tw-section tw-grey">
      <div className="row">
        <h2>How it works &mdash; simple as 1, 2, 3</h2>
        <p className="long-copy tw-lead">Speech → Kinesis → Flink → Kinesis + DynamoDB → live popups. No button per question.</p>
        <ol className="tw-steps">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="tw-step">
              <span className="tw-step-num">{i + 1}</span>
              <Icon size={34} className="tw-step-icon" />
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
