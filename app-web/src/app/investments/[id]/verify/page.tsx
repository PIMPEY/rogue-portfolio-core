'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  investmentFxSource: string | null;
  valuationFxRate: number;
  valuationFxSource: string | null;
  roundSizeEur: number | null;
  enterpriseValueEur: number | null;
  currentFairValueEur: number;
  raisedFollowOnCapital: boolean;
  clearProductMarketFit: boolean;
  meaningfulRevenue: boolean;
  status: string;
  documents: Array<{
    id: string;
    type: string;
    fileName: string;
    uploadedAt: string;
  }>;
}

export default function VerifyInvestment({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [verifiedSections, setVerifiedSections] = useState({
    A: false,
    B: false,
    C: false
  });

  useEffect(() => {
    fetchInvestment();
  }, []);

  const fetchInvestment = async () => {
    try {
      const { id } = await params;
      const response = await fetch(`/api/investments/${id}`);
      if (!response.ok) throw new Error('Failed to fetch investment');
      const data = await response.json();
      setInvestment(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!verifiedSections.A || !verifiedSections.B || !verifiedSections.C) {
      setError('Please verify all sections (A, B, and C) before confirming');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/investments/${investment?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ACTIVE',
          rationale: 'Investment verified and confirmed by deal owner'
        })
      });

      if (!response.ok) throw new Error('Failed to confirm investment');
      router.push(`/investments/${investment?.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!investment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Investment not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href={`/investments/${investment.id}`} className="text-blue-600 hover:text-blue-900 mb-4 inline-block">
            ← Back to Investment
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Verify Investment</h1>
          <p className="text-gray-600 mt-2">
            Review and confirm the investment details. An agent has populated the data from your uploaded documents.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {investment.status === 'PENDING_REVIEW' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Pending Review</span>
            </div>
            <p className="mt-1 text-sm">This investment is pending review. Verify all sections below to activate it.</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Section A — Governance Metadata</h2>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={verifiedSections.A}
                  onChange={(e) => setVerifiedSections({ ...verifiedSections, A: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Verified</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">IC Reference:</span>
                <span className="ml-2 text-gray-900">{investment.icReference}</span>
              </div>
              <div>
                <span className="text-gray-500">IC Approval Date:</span>
                <span className="ml-2 text-gray-900">{new Date(investment.icApprovalDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Investment Execution Date:</span>
                <span className="ml-2 text-gray-900">{new Date(investment.investmentExecutionDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Deal Owner:</span>
                <span className="ml-2 text-gray-900">{investment.dealOwner}</span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Section B — Deal Basics</h2>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={verifiedSections.B}
                  onChange={(e) => setVerifiedSections({ ...verifiedSections, B: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Verified</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Company Name:</span>
                <span className="ml-2 text-gray-900">{investment.companyName}</span>
              </div>
              <div>
                <span className="text-gray-500">Sector:</span>
                <span className="ml-2 text-gray-900">{investment.sector}</span>
              </div>
              <div>
                <span className="text-gray-500">Geography:</span>
                <span className="ml-2 text-gray-900">{investment.geography}</span>
              </div>
              <div>
                <span className="text-gray-500">Stage:</span>
                <span className="ml-2 text-gray-900">{investment.stage.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Section C — Instrument & Capital Structure</h2>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={verifiedSections.C}
                  onChange={(e) => setVerifiedSections({ ...verifiedSections, C: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Verified</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Investment Type:</span>
                <span className="ml-2 text-gray-900">{investment.investmentType}</span>
              </div>
              <div>
                <span className="text-gray-500">Committed Capital:</span>
                <span className="ml-2 text-gray-900">
                  {investment.committedCapitalLcl.toLocaleString()} {investment.localCurrency}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Deployed Capital:</span>
                <span className="ml-2 text-gray-900">
                  {investment.deployedCapitalLcl.toLocaleString()} {investment.localCurrency}
                </span>
              </div>
              {investment.ownershipPercent && (
                <div>
                  <span className="text-gray-500">Ownership:</span>
                  <span className="ml-2 text-gray-900">{investment.ownershipPercent}%</span>
                </div>
              )}
              {investment.coInvestors && (
                <div className="md:col-span-2">
                  <span className="text-gray-500">Co-investors:</span>
                  <span className="ml-2 text-gray-900">{investment.coInvestors}</span>
                </div>
              )}
              <div className="md:col-span-2">
                <span className="text-gray-500">Rights:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {investment.hasBoardSeat && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Board Seat</span>}
                  {investment.hasProRataRights && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Pro-rata</span>}
                  {investment.hasAntiDilutionProtection && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Anti-dilution</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Agent-Extracted Data</h2>
            <p className="text-sm text-gray-600 mb-4">
              The following data was extracted from your uploaded documents by an AI agent. Please review for accuracy.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Local Currency:</span>
                <span className="ml-2 text-gray-900">{investment.localCurrency}</span>
              </div>
              <div>
                <span className="text-gray-500">Investment FX Rate:</span>
                <span className="ml-2 text-gray-900">{investment.investmentFxRate}</span>
              </div>
              {investment.investmentFxSource && (
                <div>
                  <span className="text-gray-500">FX Source:</span>
                  <span className="ml-2 text-gray-900">{investment.investmentFxSource}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500">Valuation FX Rate:</span>
                <span className="ml-2 text-gray-900">{investment.valuationFxRate}</span>
              </div>
              {investment.valuationFxSource && (
                <div>
                  <span className="text-gray-500">Valuation FX Source:</span>
                  <span className="ml-2 text-gray-900">{investment.valuationFxSource}</span>
                </div>
              )}
              {investment.roundSizeEur && (
                <div>
                  <span className="text-gray-500">Round Size (€):</span>
                  <span className="ml-2 text-gray-900">{investment.roundSizeEur.toLocaleString()}</span>
                </div>
              )}
              {investment.enterpriseValueEur && (
                <div>
                  <span className="text-gray-500">Enterprise Value (€):</span>
                  <span className="ml-2 text-gray-900">{investment.enterpriseValueEur.toLocaleString()}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500">Current Fair Value (€):</span>
                <span className="ml-2 text-gray-900">{investment.currentFairValueEur.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {investment.documents.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Uploaded Documents</h2>
              <div className="space-y-2">
                {investment.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded">
                    <div>
                      <span className="text-gray-900">{doc.fileName}</span>
                      <span className="ml-2 text-gray-500">({doc.type})</span>
                    </div>
                    <span className="text-gray-500 text-xs">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Link
              href={`/investments/${investment.id}/edit`}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Edit Details
            </Link>
            <button
              onClick={handleConfirm}
              disabled={submitting || !verifiedSections.A || !verifiedSections.B || !verifiedSections.C}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {submitting ? 'Confirming...' : 'Confirm & Activate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
