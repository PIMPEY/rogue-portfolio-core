'use client';

import { useState, useEffect } from 'react';

interface ForecastEditorProps {
  investmentId: string;
  existingData: {
    revenue: Array<{ quarterIndex: number; value: number }>;
    cogs: Array<{ quarterIndex: number; value: number }>;
    opex: Array<{ quarterIndex: number; value: number }>;
    capex: Array<{ quarterIndex: number; value: number }>;
    ebitda: Array<{ quarterIndex: number; value: number }>;
  };
  onSave: () => void;
}

type MetricType = 'revenue' | 'cogs' | 'opex' | 'capex' | 'ebitda';
type Horizon = 1 | 3 | 5;

interface MetricRow {
  label: string;
  key: MetricType;
  color: string;
}

const METRIC_ROWS: MetricRow[] = [
  { label: 'Revenue', key: 'revenue', color: 'bg-blue-50' },
  { label: 'COGS', key: 'cogs', color: 'bg-orange-50' },
  { label: 'OPEX', key: 'opex', color: 'bg-purple-50' },
  { label: 'CAPEX', key: 'capex', color: 'bg-pink-50' },
  { label: 'EBITDA', key: 'ebitda', color: 'bg-green-50' },
];

export default function ForecastEditor({ investmentId, existingData, onSave }: ForecastEditorProps) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  const [horizon, setHorizon] = useState<Horizon>(5);
  const [data, setData] = useState<Record<MetricType, number[]>>({
    revenue: [],
    cogs: [],
    opex: [],
    capex: [],
    ebitda: [],
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Initialize data from existing forecast
  useEffect(() => {
    const quarters = horizon * 4;
    const newData: Record<MetricType, number[]> = {
      revenue: Array(quarters).fill(0),
      cogs: Array(quarters).fill(0),
      opex: Array(quarters).fill(0),
      capex: Array(quarters).fill(0),
      ebitda: Array(quarters).fill(0),
    };

    // Populate from existing data
    Object.keys(existingData).forEach((metric) => {
      const metricKey = metric as MetricType;
      existingData[metricKey].forEach((item) => {
        if (item.quarterIndex <= quarters) {
          newData[metricKey][item.quarterIndex - 1] = item.value;
        }
      });
    });

    setData(newData);
  }, [existingData, horizon]);

  const handleCellChange = (metric: MetricType, quarterIdx: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setData((prev) => ({
      ...prev,
      [metric]: prev[metric].map((v, idx) => (idx === quarterIdx ? numValue : v)),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Transform data to API format
      const payload = {
        metrics: Object.keys(data).flatMap((metric) =>
          data[metric as MetricType].map((value, idx) => ({
            metric: metric.toUpperCase(),
            quarterIndex: idx + 1,
            value,
          }))
        ),
      };

      const response = await fetch(`${BACKEND_URL}/api/investments/${investmentId}/forecast/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save forecast');
      }

      const result = await response.json();
      setSaveSuccess(true);
      setLastUpdated(new Date().toLocaleString());

      // Call parent refresh
      setTimeout(() => {
        onSave();
        setSaveSuccess(false);
      }, 2000);

    } catch (error: any) {
      setSaveError(error.message || 'Failed to save forecast data');
    } finally {
      setSaving(false);
    }
  };

  const getQuarterLabel = (quarterIdx: number) => {
    const year = Math.floor(quarterIdx / 4) + 1;
    const quarter = (quarterIdx % 4) + 1;
    return `Y${year}Q${quarter}`;
  };

  const formatNumber = (value: number) => {
    if (value === 0) return '';
    return new Intl.NumberFormat('en-US').format(value);
  };

  const quarters = horizon * 4;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Forecast Data Editor</h3>
          <p className="text-sm text-gray-500 mt-1">Click any cell to edit values</p>
        </div>

        {/* Horizon Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Horizon:</span>
          <div className="inline-flex rounded-lg border border-gray-300 bg-white">
            {([1, 3, 5] as Horizon[]).map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  horizon === h
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                } ${h === 1 ? 'rounded-l-lg' : ''} ${h === 5 ? 'rounded-r-lg' : ''}`}
              >
                {h} Year{h > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editable Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                Metric
              </th>
              {Array.from({ length: quarters }, (_, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {getQuarterLabel(idx)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {METRIC_ROWS.map((row) => (
              <tr key={row.key} className={row.color}>
                <td className="sticky left-0 z-10 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200 bg-inherit">
                  {row.label}
                </td>
                {data[row.key].map((value, idx) => (
                  <td key={idx} className="px-2 py-2">
                    <input
                      type="text"
                      value={formatNumber(value)}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, '');
                        handleCellChange(row.key, idx, rawValue);
                      }}
                      className="w-full px-2 py-1 text-sm text-right border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="0"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with Save Button */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="text-sm text-gray-600">
          {lastUpdated && (
            <span>Last updated: {lastUpdated}</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {saveSuccess && (
            <div className="flex items-center text-green-700 text-sm">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Forecast saved successfully!
            </div>
          )}

          {saveError && (
            <div className="flex items-center text-red-700 text-sm">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {saveError}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Forecast'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
