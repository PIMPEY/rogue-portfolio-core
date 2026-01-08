'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface InvestmentData {
  companyName: string;
  sector?: string;
  stage?: string;
  geography?: string;
  investmentType?: string;
  committedCapital?: number;
  deployedCapital?: number;
  ownershipPercent?: number;
  investmentDate?: string;
  roundSize?: number;
  enterpriseValue?: number;
  initialCash?: number;
  monthlyBurn?: number;
  founderNames?: string[];
  founderEmails?: string[];
  notes?: string;
}

interface ParsedResponse {
  success: boolean;
  message?: string;
  data?: {
    parsed: InvestmentData[];
    warnings: string[];
    confidence: 'high' | 'medium' | 'low';
    imported?: any[];
    errors?: Array<{ companyName: string; error: string }>;
  };
  error?: string;
}

export default function AIIngestPage() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ParsedResponse | null>(null);
  const [autoImport, setAutoImport] = useState(false);
  const [uploadMode, setUploadMode] = useState<'text' | 'file'>('text');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim()) {
      alert('Please enter some text to parse');
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/ai/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          autoImport,
        }),
      });

      const data = await res.json();
      setResponse(data);

      if (data.success && autoImport && data.data?.imported?.length > 0) {
        // Redirect to portfolio page after successful import
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (error: any) {
      setResponse({
        success: false,
        error: error.message || 'Failed to process request',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('autoImport', String(autoImport));

      const res = await fetch(`${BACKEND_URL}/api/ai/ingest/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setResponse(data);

      if (data.success && autoImport && data.data?.imported?.length > 0) {
        // Redirect to portfolio page after successful import
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (error: any) {
      setResponse({
        success: false,
        error: error.message || 'Failed to process file',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setResponse(null);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      alert(data.data?.analysis || 'Analysis completed');
    } catch (error: any) {
      alert('Failed to analyze portfolio: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Investment Ingestion</h1>
          <p className="mt-2 text-sm text-gray-600">
            Parse investment data from unstructured text or upload files (PDF, Excel, CSV) using AI.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Input</h2>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                type="button"
                onClick={() => {
                  setUploadMode('text');
                  setResponse(null);
                }}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  uploadMode === 'text'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📝 Text Input
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMode('file');
                  setResponse(null);
                }}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  uploadMode === 'file'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📎 File Upload
              </button>
            </div>

            {uploadMode === 'text' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 mb-2">
                  Paste investment data
                </label>
                <textarea
                  id="input-text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={15}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Example:

Company: PayFlow Solutions
Sector: FinTech
Stage: Series A
Investment: €2M committed, €2M deployed
Ownership: 15%
Date: Jan 15, 2024
Round: €5M total
Enterprise Value: €20M
Initial cash: €1.5M
Monthly burn: €80k
Founders: John Doe (john@payflow.com), Jane Smith (jane@payflow.com)

Or paste multiple investments, CSV data, emails, etc.`}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="auto-import"
                  checked={autoImport}
                  onChange={(e) => setAutoImport(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="auto-import" className="ml-2 block text-sm text-gray-700">
                  Automatically import to database after parsing
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 border border-transparent rounded-lg text-white font-medium ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {loading ? 'Processing...' : 'Parse Investment Data'}
              </button>

              {/* Example Button */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setInputText(`Company: TechCorp AI
Sector: DeepTech
Stage: Series B
We invested €5M at a €50M valuation
Ownership: 10%
Investment date: March 15, 2025
Total round: €15M
Founders: Alice Johnson (alice@techcorp.ai) and Bob Williams
Current cash: €8M, burning €150k/month`)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Load example data
                </button>
              </div>
            </form>
            ) : (
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                    Upload file (PDF, Excel, CSV)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".pdf,.xlsx,.xls,.csv"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, Excel, or CSV up to 10MB</p>
                    </div>
                  </div>
                  {selectedFile && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: <span className="font-medium">{selectedFile.name}</span> ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="auto-import-file"
                    checked={autoImport}
                    onChange={(e) => setAutoImport(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="auto-import-file" className="ml-2 block text-sm text-gray-700">
                    Automatically import to database after parsing
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedFile}
                  className={`w-full py-2 px-4 border border-transparent rounded-lg text-white font-medium ${
                    loading || !selectedFile
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {loading ? 'Processing...' : 'Upload and Parse File'}
                </button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Analyze Portfolio with AI
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Output</h2>

            {!response && (
              <div className="text-sm text-gray-500 italic">
                Submit the form to see parsed results here
              </div>
            )}

            {response && (
              <div className="space-y-4">
                {/* Status Badge */}
                {response.success ? (
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">{response.message}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded-lg">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">{response.error || 'Error occurred'}</span>
                  </div>
                )}

                {/* Confidence Badge */}
                {response.data?.confidence && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        response.data.confidence === 'high'
                          ? 'bg-green-100 text-green-800'
                          : response.data.confidence === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {response.data.confidence.toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Warnings */}
                {response.data?.warnings && response.data.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <h3 className="text-sm font-medium text-yellow-800 mb-2">Warnings:</h3>
                    <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                      {response.data.warnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Parsed Investments */}
                {response.data?.parsed && response.data.parsed.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Parsed Investments ({response.data.parsed.length})
                    </h3>
                    <div className="space-y-4">
                      {response.data.parsed.map((inv, idx) => (
                        <div key={idx} className="bg-gray-50 rounded p-3 text-sm">
                          <div className="font-semibold text-gray-900 mb-2">{inv.companyName}</div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            {inv.sector && (
                              <div>
                                <span className="font-medium">Sector:</span> {inv.sector}
                              </div>
                            )}
                            {inv.stage && (
                              <div>
                                <span className="font-medium">Stage:</span> {inv.stage}
                              </div>
                            )}
                            {inv.committedCapital && (
                              <div>
                                <span className="font-medium">Committed:</span> €
                                {inv.committedCapital.toLocaleString()}
                              </div>
                            )}
                            {inv.ownershipPercent && (
                              <div>
                                <span className="font-medium">Ownership:</span> {inv.ownershipPercent}%
                              </div>
                            )}
                            {inv.geography && (
                              <div>
                                <span className="font-medium">Geography:</span> {inv.geography}
                              </div>
                            )}
                            {inv.investmentType && (
                              <div>
                                <span className="font-medium">Type:</span> {inv.investmentType}
                              </div>
                            )}
                          </div>
                          {inv.founderNames && inv.founderNames.length > 0 && (
                            <div className="mt-2 text-xs text-gray-600">
                              <span className="font-medium">Founders:</span> {inv.founderNames.join(', ')}
                            </div>
                          )}
                          {inv.notes && (
                            <div className="mt-2 text-xs text-gray-500 italic">{inv.notes}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Import Errors */}
                {response.data?.errors && response.data.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <h3 className="text-sm font-medium text-red-800 mb-2">Import Errors:</h3>
                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                      {response.data.errors.map((error, idx) => (
                        <li key={idx}>
                          {error.companyName}: {error.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Success Import Message */}
                {response.data?.imported && response.data.imported.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      Successfully imported {response.data.imported.length} investment(s) to the database.
                      Redirecting to portfolio...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Documentation */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">How it works</h2>
          <div className="prose prose-sm max-w-none text-gray-600">
            <p>
              The AI agent uses Claude to extract structured investment data from unstructured text. It can
              parse:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Plain text descriptions</li>
              <li>Email content</li>
              <li>CSV/Excel data pasted as text</li>
              <li>Multiple investments in one go</li>
              <li>Incomplete data (it will flag warnings)</li>
            </ul>
            <p className="mt-3">
              The agent automatically normalizes company names, converts currencies, infers sectors, and
              validates data. Check the "Auto-import" box to save parsed data directly to your portfolio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
