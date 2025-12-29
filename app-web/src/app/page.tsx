'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Investment {
  id: string;
  companyName: string;
  sector: string;
  stage: string;
  investmentAmount: number;
  investmentDate: string;
  status: 'GREEN' | 'AMBER' | 'RED';
  runway: number | null;
  activeFlags: number;
  totalUpdates: number;
  latestUpdateQuarter: number;
}

export default function PortfolioDashboard() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'GREEN' | 'AMBER' | 'RED'>('ALL');

  useEffect(() => {
    fetch('/api/portfolio')
      .then(res => res.json())
      .then(data => {
        setInvestments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching portfolio:', err);
        setLoading(false);
      });
  }, []);

  const filteredInvestments = filter === 'ALL' 
    ? investments 
    : investments.filter(inv => inv.status === filter);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading portfolio...</div>
      </div>
    );
  }

  const stats = {
    total: investments.length,
    green: investments.filter(i => i.status === 'GREEN').length,
    amber: investments.filter(i => i.status === 'AMBER').length,
    red: investments.filter(i => i.status === 'RED').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Dashboard</h1>
          <p className="mt-2 text-gray-600">Track investment performance and identify risks</p>
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

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
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
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Investment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Runway
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updates
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvestments.map((investment) => (
                  <tr key={investment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/investments/${investment.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900"
                      >
                        {investment.companyName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {investment.sector}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {investment.stage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(investment.investmentAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`h-2 w-2 rounded-full ${getStatusColor(investment.status)} mr-2`} />
                        <span className={`text-sm font-medium ${getStatusTextColor(investment.status)}`}>
                          {investment.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {investment.runway ? `${investment.runway.toFixed(1)} months` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {investment.activeFlags}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Q{investment.latestUpdateQuarter}
                    </td>
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
