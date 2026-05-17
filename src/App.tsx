import { useEffect, useMemo, useState } from 'react';
import { ActivityRecords } from './components/ActivityRecords';
import { AppHeader } from './components/AppHeader';
import { CategoryLimits } from './components/CategoryLimits';
import { LimitOverview } from './components/LimitOverview';
import type {
  Activity,
  ActivityPayload,
  CategoryLimit,
  LimitPayload,
  LimitSummary,
} from './types';

const API_URL = 'http://localhost:4000/api';

export default function App() {
  const [limits, setLimits] = useState<CategoryLimit[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [summary, setSummary] = useState<LimitSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [limitsRes, activitiesRes, summaryRes] = await Promise.all([
        fetch(`${API_URL}/limits`),
        fetch(`${API_URL}/activities`),
        fetch(`${API_URL}/limit-summary`),
      ]);

      if (!limitsRes.ok || !activitiesRes.ok || !summaryRes.ok) {
        throw new Error('Failed to fetch data from the backend');
      }

      setLimits(await limitsRes.json());
      setActivities(await activitiesRes.json());
      setSummary(await summaryRes.json());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const requestJson = async (
    url: string,
    method: 'POST' | 'PATCH',
    body: LimitPayload | ActivityPayload,
    errorMessage: string,
  ) => {
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(errorMessage);

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : errorMessage);
      throw err;
    }
  };

  const requestDelete = async (url: string, errorMessage: string) => {
    try {
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) throw new Error(errorMessage);

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : errorMessage);
      throw err;
    }
  };

  const handleCreateLimit = (payload: LimitPayload) =>
    requestJson(`${API_URL}/limits`, 'POST', payload, 'Failed to create limit');

  const handleUpdateLimit = (id: string, payload: LimitPayload) =>
    requestJson(
      `${API_URL}/limits/${id}`,
      'PATCH',
      payload,
      'Failed to update limit',
    );

  const handleDeleteLimit = (id: string) =>
    requestDelete(`${API_URL}/limits/${id}`, 'Failed to delete limit');

  const handleCreateActivity = (payload: ActivityPayload) =>
    requestJson(
      `${API_URL}/activities`,
      'POST',
      payload,
      'Failed to create activity',
    );

  const handleUpdateActivity = (id: string, payload: ActivityPayload) =>
    requestJson(
      `${API_URL}/activities/${id}`,
      'PATCH',
      payload,
      'Failed to update activity',
    );

  const handleDeleteActivity = (id: string) =>
    requestDelete(`${API_URL}/activities/${id}`, 'Failed to delete activity');

  const totalSpent = useMemo(
    () => summary.reduce((total, item) => total + item.spent, 0),
    [summary],
  );

  const totalLimit = useMemo(
    () => summary.reduce((total, item) => total + item.limit, 0),
    [summary],
  );

  if (loading) return <div className="loading">Loading limit tracker...</div>;

  return (
    <div className="app-shell">
      <main className="container">
        <AppHeader totalSpent={totalSpent} totalLimit={totalLimit} />

        {error && <div className="error">{error}</div>}

        <LimitOverview summary={summary} />

        <ActivityRecords
          activities={activities}
          limits={limits}
          onCreateActivity={handleCreateActivity}
          onUpdateActivity={handleUpdateActivity}
          onDeleteActivity={handleDeleteActivity}
        />

        <CategoryLimits
          limits={limits}
          onCreateLimit={handleCreateLimit}
          onUpdateLimit={handleUpdateLimit}
          onDeleteLimit={handleDeleteLimit}
        />
      </main>
    </div>
  );
}
