'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Investment {
  id: string;
  icReference: string;
  icApprovalDate: string;
  investmentExecutionDate: string;
  dealOwner: string;
  companyName: string;
  sector: string;
  geography: string;
  stage: string;
  investmentType: string;
  committedCapitalLcl: number;
  deployedCapitalLcl: number;
  ownershipPercent: number | null;
  coInvestors: string | null;
  hasBoardSeat: boolean;
  hasProRataRights: boolean;
  hasAntiDilutionProtection: boolean;
  localCurrency: string;
  investmentFxRate: number;
  valuationFxRate: number;
  roundSizeEur: number | null;
  enterpriseValueEur: number | null;
  currentFairValueEur: number;
  raisedFollowOnCapital: boolean;
  clearProductMarketFit: boolean;
  meaningfulRevenue: boolean;
  status: 'PENDING_REVIEW' | 'ACTIVE' | 'EXITED' | 'WRITTEN_OFF';
  founders: Array<{ name: string; email: string }>;
}

interface ForecastData {
  revenue: Array<{ quarterIndex: number; value: number }>;
  burn: Array<{ quarterIndex: number; value: number }>;
  traction: Array<{ quarterIndex: number; value: number }>;
}

interface ActualData {
  revenue: Array<{ quarter: number; value: number }>;
  burn: Array<{ quarter: number; value: number }>;
  traction: Array<{ quarter: number; value: number }>;
  runway: Array<{ quarter: number; value: number }>;
}

interface Flag {
  id: string;
  type: string;
  metric: string | null;
  threshold: string;
  actualValue: number | null;
  forecastValue: number | null;
  deltaPct: number | null;
  status: string;
  createdAt: string;
}

interface Update {
  id: string;
  quarterIndex: number;
  submittedAt: string;
  actualRevenue: number;
  actualBurn: number;
  actualRunwayMonths: number;
  actualTraction: number;
  narrativeGood: string | null;
  narrativeBad: string | null;
  narrativeHelp: string | null;
}

export default function InvestmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  const [id, setId] = useState<string>('');
  const [data, setData] = useState<{
    investment: Investment;
    forecast: ForecastData;
    actuals: ActualData;
    updates: Update[];
    flags: Flag[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(p => setId(p.id)).catch(err => {
      console.error('Error resolving params:', err);
      setLoading(false);
    });
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`${BACKEND_URL}/api/investments/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Investment not found');
        }
        return res.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching investment:', err);
        setLoading(false);
      });
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'PENDING_REVIEW': return 'bg-yellow-500';
      case 'EXITED': return 'bg-blue-500';
      case 'WRITTEN_OFF': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getFlagTypeColor = (type: string) => {
    if (type.includes('CRITICAL')) return 'bg-red-100 text-red-800';
    if (type.includes('MISS')) return 'bg-orange-100 text-orange-800';
    if (type.includes('SPIKE')) return 'bg-yellow-100 text-yellow-800';
    if (type.includes('RISK')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const prepareChartData = (forecast: Array<{ quarterIndex: number; value: number }>, actual: Array<{ quarter: number; value: number }>) => {
    const maxPeriod = Math.max(
      ...forecast.map(f => f.quarterIndex),
      ...actual.map(a => a.quarter),
      0
    );

    const data = [];
    for (let period = 1; period <= maxPeriod; period++) {
      const forecastPoint = forecast.find(f => f.quarterIndex === period);
      const actualPoint = actual.find(a => a.quarter === period);

      data.push({
        quarter: `Y${period}`,
        forecast: forecastPoint?.value || null,
        actual: actualPoint?.value || null
      });
    }
    return data;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading investment details...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Investment not found</div>
      </div>
    );
  }

  const { investment, forecast, actuals, updates, flags } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-900 mb-4 inline-block">
            ← Back to Portfolio
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{investment.companyName}</h1>
              <div className="mt-2 flex items-center space-x-4">
                <span className="text-gray-600">{investment.sector}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{investment.stage}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{investment.geography}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">Ref: {investment.icReference}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {investment.status === 'PENDING_REVIEW' && (
                <Link
                  href={`/investments/${id}/verify`}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Verify & Activate
                </Link>
              )}
              <Link
                href={`/investments/${id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Edit Investment
              </Link>
              <div className="flex items-center">
                <span className={`h-3 w-3 rounded-full ${getStatusColor(investment.status)} mr-2`} />
                <span className="text-lg font-semibold text-gray-900">{investment.status.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Current Runway</h3>
            <div className="text-2xl font-bold text-gray-900">
              {actuals.runway.length > 0 
                ? `${actuals.runway[actuals.runway.length - 1].value.toFixed(1)} months`
                : 'N/A'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Flags</h3>
            <div className="text-2xl font-bold text-gray-900">
              {flags.filter(f => f.status === 'NEW' || f.status === 'MONITORING').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Latest Update</h3>
            <div className="text-2xl font-bold text-gray-900">
              Q{updates.length > 0 ? updates[updates.length - 1].quarterIndex : 'N/A'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue: Forecast vs Actual</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={prepareChartData(forecast.revenue, actuals.revenue)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : 'N/A'} />
                <Legend />
                <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} name="Forecast" />
                <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Burn: Forecast vs Actual</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={prepareChartData(forecast.burn, actuals.burn)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : 'N/A'} />
                <Legend />
                <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} name="Forecast" />
                <Line type="monotone" dataKey="actual" stroke="#ef4444" strokeWidth={2} name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Traction: Forecast vs Actual</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={prepareChartData(forecast.traction, actuals.traction)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} name="Forecast" />
                <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Runway Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={actuals.runway.map(r => ({ quarter: `Q${r.quarter}`, value: r.value }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip formatter={(value: number | undefined) => value !== undefined ? `${value.toFixed(1)} months` : 'N/A'} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} name="Runway (months)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Active Flags</h3>
            </div>
            <div className="p-6">
              {flags.length === 0 ? (
                <p className="text-gray-500">No flags</p>
              ) : (
                <div className="space-y-3">
                  {flags.map((flag) => (
                    <div key={flag.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFlagTypeColor(flag.type)}`}>
                            {flag.type}
                          </span>
                          <p className="mt-2 text-sm text-gray-900">{flag.threshold}</p>
                          {flag.actualValue && flag.forecastValue && (
                            <p className="mt-1 text-sm text-gray-600">
                              Actual: {formatCurrency(flag.actualValue)} vs Forecast: {formatCurrency(flag.forecastValue)}
                              {flag.deltaPct && ` (${(flag.deltaPct * 100).toFixed(0)}%)`}
                            </p>
                          )}
                        </div>
                        <span className={`text-xs font-medium ${
                          flag.status === 'NEW' ? 'text-red-600' : 
                          flag.status === 'MONITORING' ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {flag.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">{formatDate(flag.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Founder Updates</h3>
            </div>
            <div className="p-6">
              {updates.length === 0 ? (
                <p className="text-gray-500">No updates yet</p>
              ) : (
                <div className="space-y-4">
                  {updates.map((update) => (
                    <div key={update.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">Quarter {update.quarterIndex}</h4>
                        <span className="text-xs text-gray-500">{formatDate(update.submittedAt)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Revenue:</span>
                          <span className="ml-2 text-gray-900">{formatCurrency(update.actualRevenue)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Burn:</span>
                          <span className="ml-2 text-gray-900">{formatCurrency(update.actualBurn)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Traction:</span>
                          <span className="ml-2 text-gray-900">{update.actualTraction}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Runway:</span>
                          <span className="ml-2 text-gray-900">{update.actualRunwayMonths.toFixed(1)} months</span>
                        </div>
                      </div>
                      {(update.narrativeGood || update.narrativeBad || update.narrativeHelp) && (
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                          {update.narrativeGood && (
                            <p className="text-sm text-green-700">
                              <span className="font-medium">Good:</span> {update.narrativeGood}
                            </p>
                          )}
                          {update.narrativeBad && (
                            <p className="text-sm text-red-700">
                              <span className="font-medium">Bad:</span> {update.narrativeBad}
                            </p>
                          )}
                          {update.narrativeHelp && (
                            <p className="text-sm text-blue-700">
                              <span className="font-medium">Help needed:</span> {update.narrativeHelp}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
