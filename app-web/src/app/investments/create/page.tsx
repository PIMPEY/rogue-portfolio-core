'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateInvestment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    icApprovalDate: '',
    investmentExecutionDate: '',
    dealOwner: 'PJI',
    companyName: '',
    sector: '',
    geography: 'US',
    stage: 'PRE_SEED',
    investmentType: 'EQUITY',
    committedCapitalLcl: '',
    deployedCapitalLcl: '0',
    ownershipPercent: '',
    coInvestors: '',
    hasBoardSeat: false,
    hasProRataRights: false,
    hasAntiDilutionProtection: false,
    localCurrency: 'USD',
    investmentFxRate: '1.0',
    investmentFxSource: '',
    valuationFxRate: '1.0',
    valuationFxSource: '',
    roundSizeEur: '',
    enterpriseValueEur: '',
    currentFairValueEur: '',
    raisedFollowOnCapital: false,
    clearProductMarketFit: false,
    meaningfulRevenue: false,
    founderName: '',
    founderEmail: ''
  });

  const sectors = ['SaaS', 'Fintech', 'Healthcare', 'E-commerce', 'AI/ML', 'ClimateTech', 'EdTech', 'Cybersecurity', 'Other'];
  const geographies = ['US', 'GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE', 'CH', 'IE', 'Other'];
  const currencies = ['USD', 'EUR', 'GBP', 'CHF'];

  const calculateInvestmentEur = () => {
    const capital = parseFloat(formData.committedCapitalLcl) || 0;
    const fxRate = parseFloat(formData.investmentFxRate) || 1;
    return (capital / fxRate).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          committedCapitalLcl: parseFloat(formData.committedCapitalLcl),
          deployedCapitalLcl: parseFloat(formData.deployedCapitalLcl),
          ownershipPercent: formData.ownershipPercent ? parseFloat(formData.ownershipPercent) : null,
          investmentFxRate: parseFloat(formData.investmentFxRate),
          valuationFxRate: parseFloat(formData.valuationFxRate),
          roundSizeEur: formData.roundSizeEur ? parseFloat(formData.roundSizeEur) : null,
          enterpriseValueEur: formData.enterpriseValueEur ? parseFloat(formData.enterpriseValueEur) : null,
          currentFairValueEur: parseFloat(formData.currentFairValueEur),
          icApprovalDate: new Date(formData.icApprovalDate).toISOString(),
          investmentExecutionDate: new Date(formData.investmentExecutionDate).toISOString()
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create investment');
      }

      const data = await response.json();
      router.push(`/investments/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-900 mb-4 inline-block">
            ← Back to Portfolio
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Investment</h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Section A — Governance Metadata</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">IC Approval Date *</label>
                <input
                  type="date"
                  required
                  value={formData.icApprovalDate}
                  onChange={(e) => setFormData({ ...formData, icApprovalDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Investment Execution Date *</label>
                <input
                  type="date"
                  required
                  value={formData.investmentExecutionDate}
                  onChange={(e) => setFormData({ ...formData, investmentExecutionDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deal Owner *</label>
                <input
                  type="text"
                  required
                  value={formData.dealOwner}
                  onChange={(e) => setFormData({ ...formData, dealOwner: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Section B — Deal Basics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sector *</label>
                <select
                  required
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                >
                  <option value="">Select sector</option>
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Geography (HQ) *</label>
                <select
                  required
                  value={formData.geography}
                  onChange={(e) => setFormData({ ...formData, geography: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                >
                  {geographies.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stage *</label>
                <select
                  required
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                >
                  <option value="PRE_SEED">Pre-seed</option>
                  <option value="SEED">Seed</option>
                  <option value="SERIES_A">Series A</option>
                  <option value="SERIES_B">Series B</option>
                  <option value="SERIES_C">Series C</option>
                  <option value="SERIES_D_PLUS">Series D+</option>
                  <option value="GROWTH">Growth</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Section C — Instrument & Capital Structure</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Investment Type *</label>
                <select
                  required
                  value={formData.investmentType}
                  onChange={(e) => setFormData({ ...formData, investmentType: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                >
                  <option value="EQUITY">Equity</option>
                  <option value="SAFE">SAFE</option>
                  <option value="CLN">CLN</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Committed Capital (LCL) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.committedCapitalLcl}
                  onChange={(e) => setFormData({ ...formData, committedCapitalLcl: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deployed Capital to Date (LCL)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.deployedCapitalLcl}
                  onChange={(e) => setFormData({ ...formData, deployedCapitalLcl: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ownership % {formData.investmentType === 'EQUITY' ? '*' : '(Equity only)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required={formData.investmentType === 'EQUITY'}
                  disabled={formData.investmentType !== 'EQUITY'}
                  value={formData.ownershipPercent}
                  onChange={(e) => setFormData({ ...formData, ownershipPercent: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 disabled:bg-gray-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Co-investors</label>
                <input
                  type="text"
                  value={formData.coInvestors}
                  onChange={(e) => setFormData({ ...formData, coInvestors: e.target.value })}
                  placeholder="Comma-separated list"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rights</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.hasBoardSeat}
                      onChange={(e) => setFormData({ ...formData, hasBoardSeat: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Board seat</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.hasProRataRights}
                      onChange={(e) => setFormData({ ...formData, hasProRataRights: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Pro-rata rights</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.hasAntiDilutionProtection}
                      onChange={(e) => setFormData({ ...formData, hasAntiDilutionProtection: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Anti-dilution protection</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Section D — Currency & FX</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Local Currency *</label>
                <select
                  required
                  value={formData.localCurrency}
                  onChange={(e) => setFormData({ ...formData, localCurrency: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                >
                  {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Investment Amount (€)</label>
                <input
                  type="text"
                  readOnly
                  value={`€${calculateInvestmentEur()}`}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Investment FX Rate *</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={formData.investmentFxRate}
                  onChange={(e) => setFormData({ ...formData, investmentFxRate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Investment FX Source</label>
                <input
                  type="text"
                  value={formData.investmentFxSource}
                  onChange={(e) => setFormData({ ...formData, investmentFxSource: e.target.value })}
                  placeholder="e.g., ECB"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valuation FX Rate *</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={formData.valuationFxRate}
                  onChange={(e) => setFormData({ ...formData, valuationFxRate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valuation FX Source</label>
                <input
                  type="text"
                  value={formData.valuationFxSource}
                  onChange={(e) => setFormData({ ...formData, valuationFxSource: e.target.value })}
                  placeholder="e.g., ECB"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Section E — Valuation & Returns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Round Size (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.roundSizeEur}
                  onChange={(e) => setFormData({ ...formData, roundSizeEur: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Enterprise Value (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.enterpriseValueEur}
                  onChange={(e) => setFormData({ ...formData, enterpriseValueEur: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Fair Value (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.currentFairValueEur}
                  onChange={(e) => setFormData({ ...formData, currentFairValueEur: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Section F — Qualitative Status Markers</h2>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.raisedFollowOnCapital}
                  onChange={(e) => setFormData({ ...formData, raisedFollowOnCapital: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Raised follow-on capital</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.clearProductMarketFit}
                  onChange={(e) => setFormData({ ...formData, clearProductMarketFit: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Clear Product-Market Fit</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.meaningfulRevenue}
                  onChange={(e) => setFormData({ ...formData, meaningfulRevenue: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Meaningful revenue (≥ €500k ARR)</span>
              </label>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Founder Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Founder Name *</label>
                <input
                  type="text"
                  required
                  value={formData.founderName}
                  onChange={(e) => setFormData({ ...formData, founderName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Founder Email *</label>
                <input
                  type="email"
                  required
                  value={formData.founderEmail}
                  onChange={(e) => setFormData({ ...formData, founderEmail: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              href="/"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Investment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
