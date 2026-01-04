'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// import PortfolioCharts from '@/components/PortfolioCharts';
// import ActionsPanel from '@/components/ActionsPanel';

interface Investment {
  id: string;
  companyName: string;
  sector: string;
  stage: string;
  geography: string;
  investmentType: string;
  committedCapitalEur: number;
  deployedCapitalEur: number;
  ownershipPercent: number | null;
  investmentDate: string;
  currentFairValueEur: number;
  grossMoic: string;
  grossIrr: string;
  roundSizeEur: number | null;
  enterpriseValueEur: number | null;
  runway: number | null;
  status: 'GREEN' | 'AMBER' | 'RED';
  activeFlags: number;
  founders: Array<{ name: string; email: string }>;
  raisedFollowOnCapital: boolean;
  clearProductMarketFit: boolean;
  meaningfulRevenue: boolean;
  totalUpdates: number;
  latestUpdateQuarter: number;
}

type ColumnKey = keyof Investment | 'founderNames' | 'founderLinkedIns' | 'delete';

interface Column {
  key: ColumnKey;
  label: string;
  visible: boolean;
  sortable: boolean;
}

type ViewPreset = 'ALL' | 'IC' | 'FINANCE' | 'RISK';

const VIEW_PRESETS: Record<ViewPreset, ColumnKey[]> = {
  ALL: [
    'companyName', 'sector', 'stage', 'geography', 'investmentType',
    'committedCapitalEur', 'deployedCapitalEur', 'ownershipPercent',
    'investmentDate', 'currentFairValueEur', 'grossMoic', 'grossIrr',
    'roundSizeEur', 'enterpriseValueEur', 'runway', 'status', 'activeFlags',
    'founderNames', 'founderLinkedIns', 'raisedFollowOnCapital',
    'clearProductMarketFit', 'meaningfulRevenue'
  ],
  IC: [
    'companyName', 'sector', 'stage', 'geography', 'investmentType',
    'committedCapitalEur', 'ownershipPercent', 'investmentDate',
    'currentFairValueEur', 'grossMoic', 'runway', 'status', 'activeFlags',
    'founderNames', 'raisedFollowOnCapital', 'clearProductMarketFit',
    'meaningfulRevenue'
  ],
  FINANCE: [
    'companyName', 'sector', 'stage', 'investmentType',
    'committedCapitalEur', 'deployedCapitalEur', 'ownershipPercent',
    'investmentDate', 'currentFairValueEur', 'grossMoic', 'grossIrr',
    'roundSizeEur', 'enterpriseValueEur', 'runway', 'status'
  ],
  RISK: [
    'companyName', 'sector', 'stage', 'runway', 'status', 'activeFlags',
    'grossMoic', 'grossIrr', 'investmentDate', 'founderNames'
  ]
};

export default function PortfolioDashboard() {  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  const router = useRouter();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'GREEN' | 'AMBER' | 'RED'>('ALL');
  const [viewPreset, setViewPreset] = useState<ViewPreset>('ALL');
  const [columns, setColumns] = useState<Column[]>([]);
  const [sortColumn, setSortColumn] = useState<ColumnKey | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [chartFilter, setChartFilter] = useState<{ type: 'sector' | 'stage' | 'geography' | 'status' | null; value: string | null }>({ type: null, value: null });

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/investments`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Backend returned ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        // Ensure data is always an array
        const investmentsArray = data.investments || [];
        setInvestments(investmentsArray);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching portfolio:', err);
        setError(err.message);
        setInvestments([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const allColumns: Column[] = [      { key: 'delete', label: 'Actions', visible: true, sortable: false },

      { key: 'companyName', label: 'Company', visible: true, sortable: true },
      { key: 'sector', label: 'Sector', visible: true, sortable: true },
      { key: 'stage', label: 'Stage', visible: true, sortable: true },
      { key: 'geography', label: 'Geography', visible: true, sortable: true },
      { key: 'investmentType', label: 'Investment Type', visible: true, sortable: true },
      { key: 'committedCapitalEur', label: 'Committed Capital (€)', visible: true, sortable: true },
      { key: 'deployedCapitalEur', label: 'Deployed Capital (€)', visible: true, sortable: true },
      { key: 'ownershipPercent', label: 'Ownership %', visible: true, sortable: true },
      { key: 'investmentDate', label: 'Investment Date', visible: true, sortable: true },
      { key: 'currentFairValueEur', label: 'Current Fair Value (€)', visible: true, sortable: true },
      { key: 'grossMoic', label: 'Gross MOIC', visible: true, sortable: true },
      { key: 'grossIrr', label: 'Gross IRR', visible: true, sortable: true },
      { key: 'roundSizeEur', label: 'Round Size (€)', visible: true, sortable: true },
      { key: 'enterpriseValueEur', label: 'Enterprise Value (€)', visible: true, sortable: true },
      { key: 'runway', label: 'Runway', visible: true, sortable: true },
      { key: 'status', label: 'Status', visible: true, sortable: true },
      { key: 'activeFlags', label: 'Active Flags', visible: true, sortable: true },
      { key: 'founderNames', label: 'Founder Name(s)', visible: true, sortable: false },
      { key: 'founderLinkedIns', label: 'Founder LinkedIn', visible: true, sortable: false },
      { key: 'raisedFollowOnCapital', label: 'Raised Follow-on', visible: true, sortable: false },
      { key: 'clearProductMarketFit', label: 'PMF', visible: true, sortable: false },
      { key: 'meaningfulRevenue', label: 'Meaningful Revenue', visible: true, sortable: false }
    ];
    setColumns(allColumns);
  }, []);

  useEffect(() => {
    if (columns.length === 0) return;
    
    const presetColumns = VIEW_PRESETS[viewPreset];
    setColumns(prev => prev.map(col => ({
      ...col,
      visible: presetColumns.includes(col.key)
    })));
  }, [viewPreset]);

  const filteredInvestments = investments.filter(inv => {
    const statusMatch = filter === 'ALL' || inv.status === filter;
    
    if (!chartFilter.type || !chartFilter.value) return statusMatch;
    
    const chartMatch = inv[chartFilter.type as keyof Investment] === chartFilter.value;
    return statusMatch && chartMatch;
  });

  const sortedInvestments = [...filteredInvestments].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aVal = a[sortColumn as keyof Investment];
    const bVal = b[sortColumn as keyof Investment];
    
    if (aVal === bVal) return 0;
    if (aVal === null) return 1;
    if (bVal === null) return -1;
    
    const comparison = aVal < bVal ? -1 : 1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GREEN': return 'bg-green-500';
      case 'AMBER': return 'bg-yellow-500';
      case 'RED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'GREEN': return 'text-green-600';
      case 'AMBER': return 'text-yellow-600';
      case 'RED': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
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

  const handleSort = (columnKey: ColumnKey) => {
    const column = columns.find(c => c.key === columnKey);
    if (!column || !column.sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const toggleColumn = (columnKey: ColumnKey) => {
    setColumns(prev => prev.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleChartFilter = (type: 'sector' | 'stage' | 'geography' | 'status', value: string | null) => {
    setChartFilter({ type, value });
  };

  const exportToCSV = () => {
    const visibleColumns = columns.filter(c => c.visible);
    const headers = visibleColumns.map(c => c.label);
    
    const rows = sortedInvestments.map(inv => {
      return visibleColumns.map(col => {
        const key = col.key;
        if (key === 'founderNames') {
          return inv.founders.map(f => f.name).join('; ');
        }
        if (key === 'founderLinkedIns') {
          return inv.founders.map(() => 'LinkedIn').join('; ');
        }
        if (key === 'raisedFollowOnCapital') {
          return inv.raisedFollowOnCapital ? '✓' : '';
        }
        if (key === 'clearProductMarketFit') {
          return inv.clearProductMarketFit ? '✓' : '';
        }
        if (key === 'meaningfulRevenue') {
          return inv.meaningfulRevenue ? '✓' : '';
        }
        const value = inv[key as keyof Investment];
        if (typeof value === 'number') {
          return value.toString();
        }
        return value || '';
      });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleDelete = async (id: string, companyName: string) => {
    if (!confirm(`Are you sure you want to delete ${companyName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/investments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete investment');
      }

      // Remove the investment from the state
      setInvestments(prev => prev.filter(inv => inv.id !== id));
    } catch (error) {
      console.error('Error deleting investment:', error);
      alert('Failed to delete investment. Please try again.');
    }
  };


  const exportToJSON = () => {
    const jsonContent = JSON.stringify(investments, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCellValue = (inv: Investment, columnKey: ColumnKey): React.ReactNode => {    if (columnKey === 'delete') {
      return (
        <button
          onClick={() => handleDelete(inv.id, inv.companyName)}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          Delete
        </button>
      );
    }

    if (columnKey === 'founderNames') {
      return inv.founders.map(f => f.name).join(', ');
    }
    if (columnKey === 'founderLinkedIns') {
      return (
        <div className="flex gap-1">
          {inv.founders.map((f, i) => (
            <span key={i} className="text-blue-600 hover:text-blue-800 cursor-pointer" title={`${f.name}'s LinkedIn`}>
              🔗
            </span>
          ))}
        </div>
      );
    }
    if (columnKey === 'raisedFollowOnCapital') {
      return inv.raisedFollowOnCapital ? '✓' : '';
    }
    if (columnKey === 'clearProductMarketFit') {
      return inv.clearProductMarketFit ? '✓' : '';
    }
    if (columnKey === 'meaningfulRevenue') {
      return inv.meaningfulRevenue ? '✓' : '';
    }
    if (columnKey === 'companyName') {
      return (
        <Link
          href={`/investments/${inv.id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-900"
        >
          {inv.companyName}
        </Link>
      );
    }
    if (columnKey === 'status') {
      return (
        <div className="flex items-center">
          <span className={`h-2 w-2 rounded-full ${getStatusColor(inv.status)} mr-2`} />
          <span className={`text-sm font-medium ${getStatusTextColor(inv.status)}`}>
            {inv.status}
          </span>
        </div>
      );
    }
    if (columnKey === 'runway') {
      return inv.runway ? `${inv.runway.toFixed(1)} months` : 'N/A';
    }
    if (['committedCapitalEur', 'deployedCapitalEur', 'currentFairValueEur', 'roundSizeEur', 'enterpriseValueEur'].includes(columnKey as string)) {
      return formatCurrency(inv[columnKey as keyof Investment] as number | null);
    }
    if (columnKey === 'ownershipPercent') {
      return inv.ownershipPercent ? `${inv.ownershipPercent.toFixed(1)}%` : 'N/A';
    }
    if (columnKey === 'investmentDate') {
      return formatDate(inv.investmentDate);
    }
    return String(inv[columnKey as keyof Investment] ?? '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading portfolio...</div>
      </div>
    );
  }

  if (error) {
    // Auto-redirect to Simple MVP after 3 seconds
    useEffect(() => {
      const timer = setTimeout(() => {
        router.push('/simple-mvp');
      }, 3000);
      return () => clearTimeout(timer);
    }, [router]);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Backend Connection Error</h1>
          <p className="text-gray-600 mb-6">
            Unable to connect to the backend server. Redirecting to Simple MVP...
          </p>
          <p className="text-sm text-gray-500">
            <a href="/simple-mvp" className="text-blue-600 hover:underline">
              Click here if not redirected
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (investments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Investments Yet</h1>
          <p className="text-gray-600 mb-6">Get started by creating your first investment</p>
          <Link
            href="/simple-mvp"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Investment
          </Link>
        </div>
      </div>
    );
  }

  const stats = {
    total: investments.length,
    green: investments.filter(i => i.status === 'GREEN').length,
    amber: investments.filter(i => i.status === 'AMBER').length,
    red: investments.filter(i => i.status === 'RED').length
  };

  const visibleColumns = columns.filter(c => c.visible);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Portfolio Dashboard</h1>
              <p className="mt-2 text-gray-600">Track investment performance and identify risks</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/simple-mvp"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Simple MVP (No AWS)
              </Link>
              <Link
                href="/investments/create"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Investment
              </Link>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Export CSV
              </button>
              <button
                onClick={exportToJSON}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Investments</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">On Track</div>
            <div className="mt-2 text-3xl font-bold text-green-600">{stats.green}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Needs Attention</div>
            <div className="mt-2 text-3xl font-bold text-yellow-600">{stats.amber}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Critical</div>
            <div className="mt-2 text-3xl font-bold text-red-600">{stats.red}</div>
          </div>
        </div>

        <div className="mb-8">
          {/* <ActionsPanel /> */}
        </div>

        {/* <PortfolioCharts
          investments={investments}
          onFilter={handleChartFilter}
          activeFilter={chartFilter}
        /> */}

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-medium text-gray-900">Investments</h2>
                <div className="flex space-x-2">
                  {(['ALL', 'GREEN', 'AMBER', 'RED'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        filter === status
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                {chartFilter.type && chartFilter.value && (
                  <button
                    onClick={() => setChartFilter({ type: null, value: null })}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200"
                  >
                    {chartFilter.type}: {chartFilter.value} ✕
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">View:</span>
                  <select
                    value={viewPreset}
                    onChange={(e) => setViewPreset(e.target.value as ViewPreset)}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    <option value="ALL">All Columns</option>
                    <option value="IC">IC View</option>
                    <option value="FINANCE">Finance View</option>
                    <option value="RISK">Risk View</option>
                  </select>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowColumnMenu(!showColumnMenu)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Columns
                  </button>
                  {showColumnMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-96 overflow-y-auto">
                      <div className="p-2">
                        {columns.map(col => (
                          <label key={col.key} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={col.visible}
                              onChange={() => toggleColumn(col.key)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">{col.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {visibleColumns.map(col => (
                    <th
                      key={col.key}
                      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                      }`}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && sortColumn === col.key && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedInvestments.map((investment) => (
                  <tr key={investment.id} className="hover:bg-gray-50">
                    {visibleColumns.map(col => (
                      <td key={col.key} className="px-4 py-4 whitespace-nowrap text-sm">
                        {getCellValue(investment, col.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
