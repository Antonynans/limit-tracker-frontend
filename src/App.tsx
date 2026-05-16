import React, { useEffect, useMemo, useState } from 'react';

interface CategoryLimit {
  id: string;
  category: string;
  limit: number;
  createdAt: string;
}

interface Activity {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  description: string;
  date: string;
}

interface LimitSummary {
  limitId: string;
  category: string;
  limit: number;
  spent: number;
  percentage: number;
  status: 'On Track' | 'Warning' | 'Exceeded';
}

const API_URL = '/api/v1';

function toCents(value: string) {
  return Math.round(Number(value) * 100);
}

function centsToInput(cents: number) {
  return (cents / 100).toFixed(2);
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export default function App() {
  const [limits, setLimits] = useState<CategoryLimit[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [summary, setSummary] = useState<LimitSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewLimit, setShowNewLimit] = useState(false);
  const [newLimitForm, setNewLimitForm] = useState({ category: '', limit: '' });
  const [editingLimitId, setEditingLimitId] = useState('');
  const [editLimitForm, setEditLimitForm] = useState({
    category: '',
    limit: '',
  });
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [selectedLimitId, setSelectedLimitId] = useState('');
  const [newActivityForm, setNewActivityForm] = useState({
    amount: '',
    description: '',
  });
  const [editingActivityId, setEditingActivityId] = useState('');
  const [editActivityForm, setEditActivityForm] = useState({
    categoryId: '',
    amount: '',
    description: '',
  });

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

  const handleCreateLimit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/limits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newLimitForm.category,
          limit: toCents(newLimitForm.limit),
        }),
      });

      if (!res.ok) throw new Error('Failed to create limit');

      setNewLimitForm({ category: '', limit: '' });
      setShowNewLimit(false);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating limit');
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLimitId) {
      setError('Please select a category');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedLimitId,
          amount: toCents(newActivityForm.amount),
          description: newActivityForm.description,
        }),
      });

      if (!res.ok) throw new Error('Failed to create activity');

      setNewActivityForm({ amount: '', description: '' });
      setShowNewActivity(false);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating activity');
    }
  };

  const handleStartEditActivity = (activity: Activity) => {
    setShowNewActivity(false);
    setEditingActivityId(activity.id);
    setEditActivityForm({
      categoryId: activity.categoryId,
      amount: centsToInput(activity.amount),
      description: activity.description,
    });
  };

  const handleUpdateActivity = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingActivityId || !editActivityForm.categoryId) {
      setError('Please select a category');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/activities/${editingActivityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: editActivityForm.categoryId,
          amount: toCents(editActivityForm.amount),
          description: editActivityForm.description,
        }),
      });

      if (!res.ok) throw new Error('Failed to update activity');

      setEditingActivityId('');
      setEditActivityForm({ categoryId: '', amount: '', description: '' });
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating activity');
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('Delete this activity record?')) return;

    try {
      const res = await fetch(`${API_URL}/activities/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete activity');

      if (editingActivityId === id) {
        setEditingActivityId('');
        setEditActivityForm({ categoryId: '', amount: '', description: '' });
      }

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting activity');
    }
  };

  const handleStartEditLimit = (limit: CategoryLimit) => {
    setShowNewLimit(false);
    setEditingLimitId(limit.id);
    setEditLimitForm({
      category: limit.category,
      limit: centsToInput(limit.limit),
    });
  };

  const handleUpdateLimit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingLimitId) return;

    try {
      const res = await fetch(`${API_URL}/limits/${editingLimitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: editLimitForm.category,
          limit: toCents(editLimitForm.limit),
        }),
      });

      if (!res.ok) throw new Error('Failed to update limit');

      setEditingLimitId('');
      setEditLimitForm({ category: '', limit: '' });
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating limit');
    }
  };

  const handleDeleteLimit = async (id: string) => {
    if (!confirm('Delete this limit and its activity records?')) return;

    try {
      const res = await fetch(`${API_URL}/limits/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete limit');

      if (editingLimitId === id) {
        setEditingLimitId('');
        setEditLimitForm({ category: '', limit: '' });
      }

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting limit');
    }
  };

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

        {error && <div className="error">{error}</div>}

        <section className="section">
          <div className="section-title">Limit Status Overview</div>
          {summary.length === 0 ? (
            <p className="empty">Create a category limit to begin tracking usage.</p>
          ) : (
            <div className="grid">
              {summary.map(item => (
                <article key={item.limitId} className="card">
                  <div className="card-header">
                    <h2 className="capitalize">{item.category}</h2>
                    <span
                      className={`status-badge status-${item.status.toLowerCase().replace(' ', '-')}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div
                    className="progress-bar"
                    aria-label={`${item.category} is ${item.percentage}% used`}
                  >
                    <div
                      className={`progress-fill progress-${item.status.toLowerCase().replace(' ', '-')}`}
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
              ))}
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-header">
            <div className="section-title">Activity Records</div>
            {!showNewActivity && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowNewActivity(true);
                  if (limits.length > 0) setSelectedLimitId(limits[0].id);
                }}
                disabled={limits.length === 0}
              >
                New Activity
              </button>
            )}
          </div>

          {showNewActivity && (
            <form onSubmit={handleCreateActivity} className="form">
              <div className="form-row">
                <label>
                  Category
                  <select
                    value={selectedLimitId}
                    onChange={e => setSelectedLimitId(e.target.value)}
                    required
                    className="capitalize"
                  >
                    <option value="">Select a category</option>
                    {limits.map(limit => (
                      <option key={limit.id} value={limit.id}>
                        {limit.category}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Amount (NGN)
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newActivityForm.amount}
                    onChange={e =>
                      setNewActivityForm({
                        ...newActivityForm,
                        amount: e.target.value,
                      })
                    }
                    required
                    placeholder="0.00"
                  />
                </label>
              </div>
              <label>
                Description
                <input
                  type="text"
                  value={newActivityForm.description}
                  onChange={e =>
                    setNewActivityForm({
                      ...newActivityForm,
                      description: e.target.value,
                    })
                  }
                  required
                  placeholder="e.g., Grocery shopping"
                />
              </label>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Save Activity
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowNewActivity(false);
                    setNewActivityForm({ amount: '', description: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {activities.length === 0 ? (
            <p className="empty">No activity records yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map(activity => (
                    <tr key={activity.id}>
                      {editingActivityId === activity.id ? (
                        <>
                          <td colSpan={5}>
                            <form
                              onSubmit={handleUpdateActivity}
                              className="inline-form"
                            >
                              <label>
                                Description
                                <input
                                  type="text"
                                  value={editActivityForm.description}
                                  onChange={e =>
                                    setEditActivityForm({
                                      ...editActivityForm,
                                      description: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </label>
                              <label>
                                Category
                                <select
                                  value={editActivityForm.categoryId}
                                  onChange={e =>
                                    setEditActivityForm({
                                      ...editActivityForm,
                                      categoryId: e.target.value,
                                    })
                                  }
                                  required
                                  className="capitalize"
                                >
                                  <option value="">Select a category</option>
                                  {limits.map(limit => (
                                    <option key={limit.id} value={limit.id}>
                                      {limit.category}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label>
                                Amount (NGN)
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  value={editActivityForm.amount}
                                  onChange={e =>
                                    setEditActivityForm({
                                      ...editActivityForm,
                                      amount: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </label>
                              <div className="inline-actions">
                                <button type="submit" className="btn btn-primary">
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  onClick={() => {
                                    setEditingActivityId('');
                                    setEditActivityForm({
                                      categoryId: '',
                                      amount: '',
                                      description: '',
                                    });
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="capitalize">{activity.description}</td>
                          <td className="capitalize">{activity.categoryName}</td>
                          <td>{formatCurrency(activity.amount)}</td>
                          <td>{new Date(activity.date).toLocaleDateString()}</td>
                          <td>
                            <div className="row-actions">
                              <button
                                className="btn btn-secondary"
                                onClick={() => handleStartEditActivity(activity)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => handleDeleteActivity(activity.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-header">
            <div className="section-title">Category Limits</div>
            {!showNewLimit && (
              <button
                className="btn btn-primary"
                onClick={() => setShowNewLimit(true)}
              >
                New Category Limit
              </button>
            )}
          </div>

          {showNewLimit && (
            <form onSubmit={handleCreateLimit} className="form">
              <div className="form-row">
                <label>
                  Category Name
                  <input
                    type="text"
                    value={newLimitForm.category}
                    onChange={e =>
                      setNewLimitForm({
                        ...newLimitForm,
                        category: e.target.value,
                      })
                    }
                    required
                    placeholder="e.g., Groceries"
                  />
                </label>
                <label>
                  Monthly Limit (NGN)
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newLimitForm.limit}
                    onChange={e =>
                      setNewLimitForm({
                        ...newLimitForm,
                        limit: e.target.value,
                      })
                    }
                    required
                    placeholder="0.00"
                  />
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Create Limit
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowNewLimit(false);
                    setNewLimitForm({ category: '', limit: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {limits.length === 0 ? (
            <p className="empty">No categories yet. Create one above.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Limit</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {limits.map(limit => (
                    <tr key={limit.id}>
                      {editingLimitId === limit.id ? (
                        <>
                          <td colSpan={4}>
                            <form
                              onSubmit={handleUpdateLimit}
                              className="inline-form inline-form-limit"
                            >
                              <label>
                                Category Name
                                <input
                                  type="text"
                                  value={editLimitForm.category}
                                  onChange={e =>
                                    setEditLimitForm({
                                      ...editLimitForm,
                                      category: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </label>
                              <label>
                                Monthly Limit (NGN)
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  value={editLimitForm.limit}
                                  onChange={e =>
                                    setEditLimitForm({
                                      ...editLimitForm,
                                      limit: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </label>
                              <div className="inline-actions">
                                <button type="submit" className="btn btn-primary">
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  onClick={() => {
                                    setEditingLimitId('');
                                    setEditLimitForm({ category: '', limit: '' });
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="capitalize">{limit.category}</td>
                          <td>{formatCurrency(limit.limit)}</td>
                          <td>{new Date(limit.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="row-actions">
                              <button
                                className="btn btn-secondary"
                                onClick={() => handleStartEditLimit(limit)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => handleDeleteLimit(limit.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
