import { formatCurrency } from '../utils/money';

interface AppHeaderProps {
  totalSpent: number;
  totalLimit: number;
}

export function AppHeader({ totalSpent, totalLimit }: AppHeaderProps) {
  return (
    <header className="header">
      <div>
        <p className="eyebrow">Spending monitor</p>
        <h1>Category Limit Tracker</h1>
        <p>Compare activity records against category budgets in real time.</p>
      </div>
      <div className="header-stats">
        <span>Total used</span>
        <strong>{formatCurrency(totalSpent)}</strong>
        <small>of {formatCurrency(totalLimit)}</small>
      </div>
    </header>
  );
}
