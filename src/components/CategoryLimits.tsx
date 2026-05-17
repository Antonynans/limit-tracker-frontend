import { useState } from 'react';
import type { FormEvent } from 'react';
import type { CategoryLimit, LimitPayload } from '../types';
import { koboToInput, formatCurrency, toKobo } from '../utils/money';
import { useConfirm } from '../hooks/useConfirm';

interface CategoryLimitsProps {
  limits: CategoryLimit[];
  onCreateLimit: (payload: LimitPayload) => Promise<void>;
  onUpdateLimit: (id: string, payload: LimitPayload) => Promise<void>;
  onDeleteLimit: (id: string) => Promise<void>;
}

const emptyLimitForm = {
  category: '',
  limit: '',
};

export function CategoryLimits({
  limits,
  onCreateLimit,
  onUpdateLimit,
  onDeleteLimit,
}: CategoryLimitsProps) {
  const [showNewLimit, setShowNewLimit] = useState(false);
  const [newLimitForm, setNewLimitForm] = useState(emptyLimitForm);
  const [editingLimitId, setEditingLimitId] = useState('');
  const [editLimitForm, setEditLimitForm] = useState(emptyLimitForm);

  const { confirm, ConfirmPortal } = useConfirm();

  const handleCreateLimit = async (e: FormEvent) => {
    e.preventDefault();

    await onCreateLimit({
      category: newLimitForm.category,
      limit: toKobo(newLimitForm.limit),
    });

    setNewLimitForm(emptyLimitForm);
    setShowNewLimit(false);
  };

  const handleStartEditLimit = (limit: CategoryLimit) => {
    setShowNewLimit(false);
    setEditingLimitId(limit.id);
    setEditLimitForm({
      category: limit.category,
      limit: koboToInput(limit.limit),
    });
  };

  const handleUpdateLimit = async (e: FormEvent) => {
    e.preventDefault();

    await onUpdateLimit(editingLimitId, {
      category: editLimitForm.category,
      limit: toKobo(editLimitForm.limit),
    });

    setEditingLimitId('');
    setEditLimitForm(emptyLimitForm);
  };

  const handleDeleteLimit = async (id: string) => {
    const ok = await confirm({
      title: 'Delete category limit?',
      message: 'This will permanently delete the limit and all its associated activity records. This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Keep it',
    });

    if (!ok) return;

    await onDeleteLimit(id);

    if (editingLimitId === id) {
      setEditingLimitId('');
      setEditLimitForm(emptyLimitForm);
    }
  };

  return (
    <section className="section">
      {ConfirmPortal}

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
                setNewLimitForm(emptyLimitForm);
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
                              setEditLimitForm(emptyLimitForm);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </td>
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
  );
}