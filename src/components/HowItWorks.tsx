import { Ear, Radio, Sparkles } from 'lucide-react';

const STEPS = [
  { icon: Ear, title: 'Just talk', text: 'Press Start listening and chat with a friend. Every finished sentence is streamed out as it happens.' },
  { icon: Radio, title: 'Flink keeps the thread', text: 'A Flink job keyed by your session remembers the area, dish, budget and chosen place across both speakers.' },
  { icon: Sparkles, title: 'Suggestions pop up', text: 'Matches from 12,000+ Bangalore restaurants appear the moment they exist — then ask about price, menu or reviews.' },
];

export function HowItWorks() {
  return (
    <section id="how" className="section section-light">
      <h2 className="section-title reveal">How it works — simple as 1, 2, 3</h2>
      <p className="section-lead reveal">Speech → Kinesis → Flink → Kinesis + DynamoDB → live popups. No buttons per question.</p>
      <ol className="steps">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="step reveal" style={{ transitionDelay: `${i * 120}ms` }}>
            <span className="step-num">{i + 1}</span>
            <Icon size={28} className="step-icon" />
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
