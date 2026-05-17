import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Activity, ActivityPayload, CategoryLimit } from '../types';
import { koboToInput, formatCurrency, toKobo } from '../utils/money';
import { useConfirm } from '../hooks/useConfirm';

interface ActivityRecordsProps {
  activities: Activity[];
  limits: CategoryLimit[];
  onCreateActivity: (payload: ActivityPayload) => Promise<void>;
  onUpdateActivity: (id: string, payload: ActivityPayload) => Promise<void>;
  onDeleteActivity: (id: string) => Promise<void>;
}

const emptyActivityForm = {
  amount: '',
  description: '',
};

const emptyEditActivityForm = {
  categoryId: '',
  amount: '',
  description: '',
};

export function ActivityRecords({
  activities,
  limits,
  onCreateActivity,
  onUpdateActivity,
  onDeleteActivity,
}: ActivityRecordsProps) {
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [selectedLimitId, setSelectedLimitId] = useState('');
  const [newActivityForm, setNewActivityForm] = useState(emptyActivityForm);
  const [editingActivityId, setEditingActivityId] = useState('');
  const [editActivityForm, setEditActivityForm] = useState(
    emptyEditActivityForm,
  );

  const { confirm, ConfirmPortal } = useConfirm();

  const handleCreateActivity = async (e: FormEvent) => {
    e.preventDefault();

    await onCreateActivity({
      categoryId: selectedLimitId,
      amount: toKobo(newActivityForm.amount),
      description: newActivityForm.description,
    });

    setNewActivityForm(emptyActivityForm);
    setShowNewActivity(false);
  };

  const handleStartEditActivity = (activity: Activity) => {
    setShowNewActivity(false);
    setEditingActivityId(activity.id);
    setEditActivityForm({
      categoryId: activity.categoryId,
      amount: koboToInput(activity.amount),
      description: activity.description,
    });
  };

  const handleUpdateActivity = async (e: FormEvent) => {
    e.preventDefault();

    await onUpdateActivity(editingActivityId, {
      categoryId: editActivityForm.categoryId,
      amount: toKobo(editActivityForm.amount),
      description: editActivityForm.description,
    });

    setEditingActivityId('');
    setEditActivityForm(emptyEditActivityForm);
  };

  const handleDeleteActivity = async (id: string) => {
    const ok = await confirm({
      title: 'Delete activity?',
      message: 'This activity record will be permanently removed. This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Keep it',
    });

    if (!ok) return;

    await onDeleteActivity(id);

    if (editingActivityId === id) {
      setEditingActivityId('');
      setEditActivityForm(emptyEditActivityForm);
    }
  };

  return (
    <section className="section">
      {ConfirmPortal}

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
                setNewActivityForm(emptyActivityForm);
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
                              setEditActivityForm(emptyEditActivityForm);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </td>
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
  );
}