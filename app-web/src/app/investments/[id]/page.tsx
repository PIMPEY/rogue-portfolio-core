'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import ForecastEditor from '@/components/ForecastEditor';
import ForecastSidePanel from '@/components/ForecastSidePanel';

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
  calculatedRunwayMonths: number | null;
  cashAtSnapshot: number | null;
  snapshotDate: string | null;
  liquidityExpectation: string | null;
  expectedLiquidityDate: string | null;
  monthlyBurn: number | null;
  raisedFollowOnCapital: boolean;
  clearProductMarketFit: boolean;
  meaningfulRevenue: boolean;
  status: 'PENDING_REVIEW' | 'ACTIVE' | 'EXITED' | 'WRITTEN_OFF';
  founders: Array<{ name: string; email: string }>;
}

interface ForecastData {
  revenue: Array<{ quarterIndex: number; value: number }>;
  cogs: Array<{ quarterIndex: number; value: number }>;
  opex: Array<{ quarterIndex: number; value: number }>;
  capex: Array<{ quarterIndex: number; value: number }>;
  ebitda: Array<{ quarterIndex: number; value: number }>;
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
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showEditor] = useState(true);
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);

  useEffect(() => {
    params.then(p => setId(p.id)).catch(err => {
      console.error('Error resolving params:', err);
      setLoading(false);
    });
  }, [params]);

  const refreshData = () => {
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
  };

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleExcelUpload = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setUploadError('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('investmentId', id);

    try {
      const response = await fetch(`${BACKEND_URL}/api/templates/import`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0] || 'Upload failed');
      }

      const result = await response.json();
      setUploadSuccess(`✓ Success! Created ${result.data.forecastMetricsCreated} forecast metrics for ${result.data.companyName}`);

      // Refresh the data after 1.5 seconds
      setTimeout(() => {
        fetch(`${BACKEND_URL}/api/investments/${id}`)
          .then(res => res.json())
          .then(data => setData(data))
          .catch(err => console.error('Error refreshing data:', err));
      }, 1500);

    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload Excel file');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleExcelUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

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

        {/* Forecast Editor Section */}
        {showEditor && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Forecast Management</h2>
                <p className="text-sm text-gray-500 mt-1">Edit forecast data directly or use quick adjustments</p>
              </div>
              <button
                onClick={() => setShowSidePanel(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Quick Adjustments
              </button>
            </div>
            <ForecastEditor
              investmentId={id}
              existingData={{
                revenue: forecast.revenue,
                cogs: forecast.cogs,
                opex: forecast.opex,
                capex: forecast.capex,
                ebitda: forecast.ebitda,
                burn: forecast.burn,
              }}
              onSave={refreshData}
            />
          </div>
        )}

        {/* Excel Upload Section - Collapsible */}
        <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 mb-8">
          <button
            onClick={() => setShowExcelUpload(!showExcelUpload)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors rounded-lg"
          >
            <div>
              <h2 className="text-sm font-medium text-gray-700">Advanced: Bulk Import from Excel</h2>
              <p className="text-xs text-gray-500 mt-1">
                For advanced users or large datasets - upload an Excel template with Y1-Y5 projections
              </p>
            </div>
            <svg
              className={`h-5 w-5 text-gray-500 transition-transform ${showExcelUpload ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showExcelUpload && (
            <div className="px-6 pb-6 pt-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">

              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => e.target.files?.[0] && handleExcelUpload(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />

                {uploading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-sm font-medium text-gray-700">Processing Excel file...</p>
                  </div>
                ) : (
                  <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {dragActive ? 'Drop Excel file here' : 'Drag and drop Excel file here'}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">or click to browse</p>
                    <p className="mt-3 text-xs text-gray-400">Supports .xlsx and .xls files</p>
                  </div>
                )}
              </div>

              {/* Success/Error Messages */}
              {uploadSuccess && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-green-800">{uploadSuccess}</p>
                </div>
              )}

              {uploadError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <svg className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-800">{uploadError}</p>
                </div>
              )}
                </div>

                {/* Download Template Link */}
                <div className="ml-6 flex-shrink-0">
                  <a
                    href={`${BACKEND_URL}/api/templates/download`}
                    download="investment-forecast-template.xlsx"
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Template
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Current Runway</h3>
            <div className="text-2xl font-bold text-gray-900">
              {actuals.runway.length > 0
                ? `${actuals.runway[actuals.runway.length - 1].value.toFixed(1)} months`
                : investment.calculatedRunwayMonths
                  ? `${investment.calculatedRunwayMonths.toFixed(1)} months`
                  : 'N/A'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">ETA Next Fundraise</h3>
            <div className="text-2xl font-bold text-gray-900">
              {(() => {
                if (investment.expectedLiquidityDate) {
                  const date = new Date(investment.expectedLiquidityDate);
                  const quarter = `Q${Math.floor(date.getMonth() / 3) + 1}`;
                  const year = date.getFullYear();
                  const round = investment.stage === 'SEED' ? 'Series A' :
                                investment.stage === 'SERIES_A' ? 'Series B' :
                                investment.stage === 'SERIES_B' ? 'Series C' : 'Next Round';
                  return `${round} - ${quarter} ${year}`;
                }
                // Calculate 6 months before runway expires
                if (investment.calculatedRunwayMonths) {
                  const fundraiseMonths = Math.max(0, investment.calculatedRunwayMonths - 6);
                  const today = new Date();
                  const fundraiseDate = new Date(today.setMonth(today.getMonth() + fundraiseMonths));
                  const quarter = `Q${Math.floor(fundraiseDate.getMonth() / 3) + 1}`;
                  const year = fundraiseDate.getFullYear();
                  const round = investment.stage === 'SEED' ? 'Series A' :
                                investment.stage === 'SERIES_A' ? 'Series B' :
                                investment.stage === 'SERIES_B' ? 'Series C' : 'Next Round';
                  return `${round} - ${quarter} ${year}`;
                }
                return investment.liquidityExpectation || 'N/A';
              })()}
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
            <div className={`text-2xl font-bold ${
              (() => {
                const daysSinceInvestment = Math.floor((new Date().getTime() - new Date(investment.investmentExecutionDate).getTime()) / (1000 * 60 * 60 * 24));
                const isOverdue = updates.length === 0 && daysSinceInvestment > 90;
                return isOverdue ? 'text-red-600' : 'text-gray-900';
              })()
            }`}>
              {updates.length > 0
                ? `Q${updates[updates.length - 1].quarterIndex}`
                : (() => {
                    const daysSinceInvestment = Math.floor((new Date().getTime() - new Date(investment.investmentExecutionDate).getTime()) / (1000 * 60 * 60 * 24));
                    return daysSinceInvestment > 90 ? 'OVERDUE' : `${daysSinceInvestment}d`;
                  })()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {updates.length === 0 && 'First update due 90 days after investment'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue: Forecast vs Actual</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={prepareChartData(forecast.revenue, actuals.revenue)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : 'N/A'} />
                <Legend />
                <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} name="Forecast" dot={false} />
                <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={0} name="Actual" dot={{ r: 6, fill: '#10b981' }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">COGS (Cost of Goods Sold)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecast.cogs.map(m => ({ quarter: `Y${m.quarterIndex}`, forecast: m.value }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : 'N/A'} />
                <Legend />
                <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} name="COGS Forecast" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">OPEX (Operating Expenses)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecast.opex.map(m => ({ quarter: `Y${m.quarterIndex}`, forecast: m.value }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : 'N/A'} />
                <Legend />
                <Line type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={2} name="OPEX Forecast" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">CAPEX (Capital Expenditures)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecast.capex.map(m => ({ quarter: `Y${m.quarterIndex}`, forecast: m.value }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : 'N/A'} />
                <Legend />
                <Line type="monotone" dataKey="forecast" stroke="#ec4899" strokeWidth={2} name="CAPEX Forecast" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">EBITDA (Profitability Path)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecast.ebitda.map(m => ({ quarter: `Y${m.quarterIndex}`, forecast: m.value }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : 'N/A'} />
                <Legend />
                <Line type="monotone" dataKey="forecast" stroke="#10b981" strokeWidth={2} name="EBITDA Forecast" />
                <ReferenceLine y={0} stroke="#000" strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cash Balance Over Time (18-Month Runway)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={(() => {
                const cashData = [];
                const startingCash = investment.cashAtSnapshot || 1200000; // Default €1.2M
                const monthlyBurn = investment.monthlyBurn || 66667; // €800k/year = €66.7k/mo

                // Generate 18 months of cash depletion
                for (let month = 0; month <= 18; month++) {
                  const remainingCash = Math.max(0, startingCash - (monthlyBurn * month));
                  cashData.push({
                    quarter: `M${month}`,
                    balance: remainingCash
                  });
                }

                return cashData;
              })()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
                <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : 'N/A'} />
                <Legend />
                <Line type="monotone" dataKey="balance" stroke="#06b6d4" strokeWidth={2} name="Cash Balance" />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" label="Zero Cash" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Traction (Customer Count)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={(() => {
                // Generate dummy customer growth: 10 → 500 over 18 months
                const tractionData = [];
                for (let month = 0; month <= 18; month++) {
                  // Exponential growth curve
                  const customers = Math.floor(10 * Math.pow(1.25, month));
                  tractionData.push({
                    quarter: `M${month}`,
                    forecast: customers,
                    actual: month <= 6 ? customers + Math.floor(Math.random() * 10 - 5) : null // Actuals for first 6 months
                  });
                }
                return tractionData;
              })()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Customers', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} name="Forecast Growth" dot={false} />
                <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={0} name="Actual" dot={{ r: 6, fill: '#10b981' }} connectNulls={false} />
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

        {/* Side Panel for Quick Adjustments */}
        <ForecastSidePanel
          isOpen={showSidePanel}
          onClose={() => setShowSidePanel(false)}
          onUpdate={refreshData}
        />
      </div>
    </div>
  );
}
