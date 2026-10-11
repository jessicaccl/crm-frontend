import { Construction } from 'lucide-react';
import '../Customers/styles.css';
import './styles.css';

interface Props {
  title: string;
  phase: number;
  items: string[];
}

export const ComingSoon = ({ title, phase, items }: Props) => (
  <main className="container">
    <header className="pageHeader">
      <div>
        <h1>{title}</h1>
        <p className="pageSubtitle">Em construção</p>
      </div>
    </header>

    <section className="comingSoon">
      <Construction size={28} />
      <span className="comingSoonPhase">Chega na fase {phase}</span>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  </main>
);
