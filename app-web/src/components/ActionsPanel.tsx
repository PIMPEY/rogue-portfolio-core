'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Action {
  id: string;
  type: string;
  actionOwner: string;
  reviewDate: string;
  notes: string;
  status: string;
  exitType?: string | null;
  indicativeValuationMin?: number | null;
  indicativeValuationMax?: number | null;
  knownAcquirers?: string | null;
  clearedBy?: string | null;
  clearRationale?: string | null;
  investment: {
    companyName: string;
    sector: string;
    stage: string;
  };
}

interface ActionsPanelProps {
  investmentId?: string;
}

export default function ActionsPanel({ investmentId }: ActionsPanelProps) {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);

  const [formData, setFormData] = useState({
    type: 'MONITOR',
    actionOwner: 'PJI',
    reviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    status: 'PENDING' as string,
    exitType: '',
    indicativeValuationMin: '',
    indicativeValuationMax: '',
    knownAcquirers: '',
    clearedBy: '',
    clearRationale: ''
  });

  useEffect(() => {
    fetchActions();
  }, [investmentId]);

  const fetchActions = async () => {
    try {
      const url = investmentId 
        ? `/api/actions?investmentId=${investmentId}`
        : '/api/actions?status=PENDING';
      const response = await fetch(url);
      const data = await response.json();
      setActions(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching actions:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload: any = {
        type: formData.type,
        actionOwner: formData.actionOwner,
        reviewDate: formData.reviewDate,
        notes: formData.notes
      };

      if (formData.type === 'EXIT_PREPARATION') {
        payload.exitType = formData.exitType;
        payload.indicativeValuationMin = formData.indicativeValuationMin ? parseFloat(formData.indicativeValuationMin) : null;
        payload.indicativeValuationMax = formData.indicativeValuationMax ? parseFloat(formData.indicativeValuationMax) : null;
        payload.knownAcquirers = formData.knownAcquirers;
      }

      if (editingAction) {
        payload.status = formData.status === 'CLEARED' ? 'CLEARED' : 'IN_PROGRESS';
        if (formData.status === 'CLEARED') {
          payload.clearedBy = formData.clearedBy;
          payload.clearRationale = formData.clearRationale;
        }

        await fetch(`/api/actions/${editingAction.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        payload.investmentId = investmentId;
        await fetch('/api/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      setShowCreateForm(false);
      setEditingAction(null);
      setFormData({
        type: 'MONITOR',
        actionOwner: 'PJI',
        reviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '',
        status: 'PENDING',
        exitType: '',
        indicativeValuationMin: '',
        indicativeValuationMax: '',
        knownAcquirers: '',
        clearedBy: '',
        clearRationale: ''
      });
      fetchActions();
    } catch (error) {
      console.error('Error saving action:', error);
    }
  };

  const handleEdit = (action: Action) => {
    setEditingAction(action);
    setFormData({
      type: action.type,
      actionOwner: action.actionOwner,
      reviewDate: action.reviewDate.split('T')[0],
      notes: action.notes,
      status: action.status,
      exitType: action.exitType || '',
      indicativeValuationMin: action.indicativeValuationMin?.toString() || '',
      indicativeValuationMax: action.indicativeValuationMax?.toString() || '',
      knownAcquirers: action.knownAcquirers || '',
      clearedBy: '',
      clearRationale: ''
    });
    setShowCreateForm(true);
  };

  const handleClear = async (actionId: string) => {
    const rationale = prompt('Please provide rationale for clearing this action:');
    if (!rationale) return;

    try {
      await fetch(`/api/actions/${actionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CLEARED',
          clearedBy: 'PJI',
          clearRationale: rationale
        })
      });
      fetchActions();
    } catch (error) {
      console.error('Error clearing action:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CLEARED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="text-gray-600">Loading actions...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Actions Required</h3>
        {!investmentId && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            {showCreateForm ? 'Cancel' : 'Create Action'}
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            {editingAction ? 'Update Action' : 'Create New Action'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Action Type *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                >
                  <option value="SUPPORT">Support</option>
                  <option value="FOLLOW_ON">Follow-on</option>
                  <option value="MONITOR">Monitor</option>
                  <option value="EXIT_PREPARATION">Exit Preparation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Action Owner *</label>
                <input
                  type="text"
                  required
                  value={formData.actionOwner}
                  onChange={(e) => setFormData({ ...formData, actionOwner: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Review Date *</label>
                <input
                  type="date"
                  required
                  value={formData.reviewDate}
                  onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              {formData.type === 'EXIT_PREPARATION' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Exit Type</label>
                    <select
                      value={formData.exitType}
                      onChange={(e) => setFormData({ ...formData, exitType: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    >
                      <option value="">Select exit type</option>
                      <option value="M_AND_A">M&A</option>
                      <option value="SECONDARY">Secondary</option>
                      <option value="IPO">IPO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Indicative Valuation Min (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.indicativeValuationMin}
                      onChange={(e) => setFormData({ ...formData, indicativeValuationMin: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Indicative Valuation Max (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.indicativeValuationMax}
                      onChange={(e) => setFormData({ ...formData, indicativeValuationMax: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Known Acquirers</label>
                    <input
                      type="text"
                      value={formData.knownAcquirers}
                      onChange={(e) => setFormData({ ...formData, knownAcquirers: e.target.value })}
                      placeholder="Comma-separated list"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    />
                  </div>
                </>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes *</label>
              <textarea
                required
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingAction ? 'Update Action' : 'Create Action'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingAction(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {actions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-500">
          No actions required
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((action) => (
            <div key={action.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(action.status)}`}>
                      {action.status}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {action.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{action.notes}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Owner: {action.actionOwner}</span>
                    <span>Review: {formatDate(action.reviewDate)}</span>
                  </div>
                  {action.exitType && (
                    <div className="mt-2 text-xs text-gray-500">
                      <span>Exit: {action.exitType.replace('_', ' ')}</span>
                      {action.indicativeValuationMin && (
                        <span> | Valuation: €{action.indicativeValuationMin.toLocaleString()} - €{action.indicativeValuationMax?.toLocaleString()}</span>
                      )}
                    </div>
                  )}
                  {action.clearRationale && (
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="font-medium">Clear rationale:</span> {action.clearRationale}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {action.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleEdit(action)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleClear(action.id)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Clear
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
