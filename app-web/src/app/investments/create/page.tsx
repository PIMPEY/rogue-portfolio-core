'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UploadedFile {
  file: File;
  category: string;
  status: 'uploading' | 'success' | 'failed';
  key?: string;
  checksum?: string;
}

const DOCUMENT_CATEGORIES = [
  { value: 'PITCH_DECK', label: 'Pitch Deck' },
  { value: 'FINANCIAL_MODEL', label: 'Financial Model' },
  { value: 'HISTORICAL_FINANCIALS', label: 'Historical Financials' },
  { value: 'LEGAL_SHAREHOLDING', label: 'Legal / Shareholding' },
  { value: 'MARKET_RESEARCH', label: 'Market / Research' },
  { value: 'OTHER', label: 'Other' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export default function CreateInvestment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [investmentId, setInvestmentId] = useState<string | null>(null);

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

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const sectors = ['SaaS', 'Fintech', 'Healthcare', 'E-commerce', 'AI/ML', 'ClimateTech', 'EdTech', 'Cybersecurity', 'Other'];
  const geographies = ['US', 'GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE', 'CH', 'IE', 'Other'];

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    let totalSize = uploadedFiles.reduce((sum, f) => sum + f.file.size, 0);

    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`File "${file.name}" is not supported. Please upload PDF, XLS, XLSX, or DOCX files.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`File "${file.name}" exceeds the 10MB limit.`);
        return;
      }

      totalSize += file.size;
      if (totalSize > MAX_TOTAL_SIZE) {
        setError('Total upload size exceeds 50MB limit.');
        return;
      }

      newFiles.push({
        file,
        category: 'OTHER',
        status: 'uploading',
      });
    }

    setUploadedFiles([...uploadedFiles, ...newFiles]);
    setError('');

    for (const uploadedFile of newFiles) {
      await uploadFile(uploadedFile);
    }
  };

  const uploadFile = async (uploadedFile: UploadedFile) => {
    try {
      if (!investmentId) {
        throw new Error('Investment not created yet');
      }

      const response = await fetch('/api/documents/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investmentId,
          fileName: uploadedFile.file.name,
          contentType: uploadedFile.file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { url, key } = await response.json();

      const fileBuffer = await uploadedFile.file.arrayBuffer();
      const checksum = await calculateChecksum(new Uint8Array(fileBuffer));

      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: fileBuffer,
        headers: { 'Content-Type': uploadedFile.file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      setUploadedFiles(prev =>
        prev.map(f =>
          f === uploadedFile
            ? { ...f, status: 'success', key, checksum }
            : f
        )
      );
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadedFiles(prev =>
        prev.map(f =>
          f === uploadedFile
            ? { ...f, status: 'failed' }
            : f
        )
      );
      setError(`Failed to upload ${uploadedFile.file.name}: ${err.message}`);
    }
  };

  const calculateChecksum = async (data: Uint8Array): Promise<string> => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileCategory = (index: number, category: string) => {
    setUploadedFiles(prev =>
      prev.map((f, i) => (i === index ? { ...f, category } : f))
    );
  };

  const createInvestment = async () => {
    const response = await fetch('/api/investments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        status: 'PENDING_REVIEW',
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
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create investment');
    }

    return response.json();
  };

  const completeUpload = async () => {
    const successfulUploads = uploadedFiles.filter(f => f.status === 'success' && f.key && f.checksum);

    if (successfulUploads.length === 0) {
      return;
    }

    const response = await fetch('/api/documents/upload-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        investmentId,
        documents: successfulUploads.map(f => ({
          key: f.key,
          fileName: f.file.name,
          fileSize: f.file.size,
          contentType: f.file.type,
          category: f.category,
          checksum: f.checksum,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to complete upload');
    }
  };

  const startReview = async () => {
    const response = await fetch('/api/review/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ investmentId }),
    });

    if (!response.ok) {
      throw new Error('Failed to start review');
    }

    return response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const failedUploads = uploadedFiles.filter(f => f.status === 'failed');
      if (failedUploads.length > 0) {
        throw new Error('Some files failed to upload. Please remove them and try again.');
      }

      const data = await createInvestment();
      setInvestmentId(data.id);

      await completeUpload();
      await startReview();

      router.push(`/investments/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const allFilesUploaded = uploadedFiles.every(f => f.status === 'success') || uploadedFiles.length === 0;
  const hasFailedUploads = uploadedFiles.some(f => f.status === 'failed');

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
            <h2 className="text-lg font-medium text-gray-900 mb-4">Section D — Document Upload</h2>
            <p className="text-sm text-gray-600 mb-4">
              Upload investment documents for background agent review. Supported formats: PDF, XLS, XLSX, DOCX. Max 10MB per file, 50MB total.
            </p>

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileSelect(e.dataTransfer.files);
              }}
            >
              <input
                type="file"
                id="documents"
                multiple
                accept=".pdf,.xls,.xlsx,.doc,.docx"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
              <label htmlFor="documents" className="cursor-pointer">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                <span className="text-xs text-gray-500 block mt-1">PDF, XLS, XLSX, DOCX (max 10MB each, 50MB total)</span>
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-3">
                {uploadedFiles.map((uploadedFile, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">{uploadedFile.file.name}</span>
                        <span className="text-xs text-gray-500">({(uploadedFile.file.size / 1024).toFixed(1)} KB)</span>
                        {uploadedFile.status === 'uploading' && (
                          <span className="text-xs text-blue-600">Uploading...</span>
                        )}
                        {uploadedFile.status === 'success' && (
                          <span className="text-xs text-green-600">✓</span>
                        )}
                        {uploadedFile.status === 'failed' && (
                          <span className="text-xs text-red-600">✗ Failed</span>
                        )}
                      </div>
                      <select
                        value={uploadedFile.category}
                        onChange={(e) => updateFileCategory(index, e.target.value)}
                        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-1"
                        disabled={uploadedFile.status === 'uploading'}
                      >
                        {DOCUMENT_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-900 text-sm"
                      disabled={uploadedFile.status === 'uploading'}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-900">What happens next?</h3>
                <p className="text-sm text-blue-700 mt-1">
                  After submission, an agent will review your documents and populate the remaining fields (FX rates, valuations, founder info, etc.). You'll be able to verify and confirm all data before the investment becomes active.
                </p>
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
              disabled={loading || !allFilesUploaded || hasFailedUploads}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
