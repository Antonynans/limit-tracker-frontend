import type { LimitSummary } from '../types';
import { formatCurrency } from '../utils/money';

interface LimitOverviewProps {
  summary: LimitSummary[];
}

export function LimitOverview({ summary }: LimitOverviewProps) {
  return (
    <section className="section">
      <div className="section-title">Limit Status Overview</div>
      {summary.length === 0 ? (
        <p className="empty">Create a category limit to begin tracking usage.</p>
      ) : (
        <div className="grid">
          {summary.map(item => {
            const statusClass = item.status.toLowerCase().replace(' ', '-');

            return (
              <article key={item.limitId} className="card">
                <div className="card-header">
                  <h2 className="capitalize">{item.category}</h2>
                  <span className={`status-badge status-${statusClass}`}>
                    {item.status}
                  </span>
                </div>

                <div
                  className="progress-bar"
                  aria-label={`${item.category} is ${item.percentage}% used`}
                >
                  <div
                    className={`progress-fill progress-${statusClass}`}
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>

                <div className="stat">
                  <span>Spent</span>
                  <strong>{formatCurrency(item.spent)}</strong>
                </div>
                <div className="stat">
                  <span>Limit</span>
                  <strong>{formatCurrency(item.limit)}</strong>
                </div>
                <div className="stat">
                  <span>Usage</span>
                  <strong>{item.percentage}%</strong>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
