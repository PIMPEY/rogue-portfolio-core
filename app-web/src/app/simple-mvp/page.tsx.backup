'use client';

import { useState } from 'react';

interface Document {
  id: string;
  fileName: string;
  fileSize: number;
  type: string;
  content: string;
}

interface AnalysisResult {
  founders: Array<{ name: string; email: string }>;
  metrics: { revenue: number; growth: number; burn: number; runway: number };
  valuation: { preMoney: number; postMoney: number; rationale: string };
  market: { tam: number; sam: number; som: number; analysis: string };
  risks: string[];
  opportunities: string[];
  summary: string;
}

export default function SimpleMVP() {
  const [investment, setInvestment] = useState({
    companyName: '',
    sector: '',
    stage: 'SEED',
    committedCapital: '',
    dealOwner: '',
  });

  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setInvestment({ ...investment, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    setError('');

    try {
      const newDocs: Document[] = [];

      for (const file of Array.from(files)) {
        const content = await fileToBase64(file);
        newDocs.push({
          id: Math.random().toString(36).substr(2, 9),
          fileName: file.name,
          fileSize: file.size,
          type: file.type,
          content,
        });
      }

      setDocuments([...documents, ...newDocs]);
      setSuccess(`Uploaded ${newDocs.length} document(s)`);
    } catch (err: any) {
      setError('Failed to upload files: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const removeDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  const createInvestment = async () => {
    if (!investment.companyName || !investment.committedCapital) {
      setError('Please fill in required fields');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const response = await fetch('/api/investments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investment: {
            ...investment,
            committedCapitalLcl: parseFloat(investment.committedCapital),
            currentFairValueEur: parseFloat(investment.committedCapital),
            icApprovalDate: new Date().toISOString(),
            investmentExecutionDate: new Date().toISOString(),
            icReference: `IC-${Date.now()}`,
          },
          files: documents.map((doc) => ({
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            filePath: `local://${doc.fileName}`,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create investment');
      }

      const result = await response.json();
      setSuccess('Investment created successfully!');
      setAnalysis(null);
    } catch (err: any) {
      setError('Failed to create investment: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const analyzeWithChatGPT = async () => {
    if (documents.length === 0) {
      setError('Please upload at least one document');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      
      const response = await fetch(`${BACKEND_URL}/api/review/analyze-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investmentId: null,
          documents: documents.map((doc) => ({
            fileName: doc.fileName,
            type: 'PITCH_DECK',
            content: doc.content,
          })),
          investment: {
            companyName: investment.companyName,
            sector: investment.sector,
            stage: investment.stage,
            committedCapitalLcl: parseFloat(investment.committedCapital) || 0,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze');
      }

      const result = await response.json();
      setAnalysis(result.analysis);
      setSuccess('Analysis completed!');
    } catch (err: any) {
      setError('Failed to analyze: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Simple Investment MVP</h1>
          <p className="text-gray-600 mb-8">Create investments and analyze documents with ChatGPT (no AWS required)</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={investment.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., TechStartup Inc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector
                </label>
                <input
                  type="text"
                  name="sector"
                  value={investment.sector}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., SaaS, Fintech"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stage
                </label>
                <select
                  name="stage"
                  value={investment.stage}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PRE_SEED">Pre-Seed</option>
                  <option value="SEED">Seed</option>
                  <option value="SERIES_A">Series A</option>
                  <option value="SERIES_B">Series B</option>
                  <option value="SERIES_C">Series C+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Committed Capital (€) *
                </label>
                <input
                  type="number"
                  name="committedCapital"
                  value={investment.committedCapital}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 500000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deal Owner
                </label>
                <input
                  type="text"
                  name="dealOwner"
                  value={investment.dealOwner}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Documents
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
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
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT up to 10MB</p>
                </div>
              </div>
            </div>

            {documents.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents</h3>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {(doc.fileSize / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeDocument(doc.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={createInvestment}
                disabled={uploading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? 'Creating...' : 'Create Investment'}
              </button>

              <button
                onClick={analyzeWithChatGPT}
                disabled={analyzing || documents.length === 0}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {analyzing ? 'Analyzing...' : 'Analyze with ChatGPT'}
              </button>
            </div>
          </div>

          {analysis && (
            <div className="mt-8 border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">ChatGPT Analysis</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{analysis.summary}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Founders</h3>
                  <div className="space-y-2">
                    {analysis.founders.map((founder, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-md">
                        <p className="font-medium">{founder.name}</p>
                        <p className="text-sm text-gray-600">{founder.email}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-md">
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="text-xl font-bold text-blue-600">
                        €{analysis.metrics.revenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-md">
                      <p className="text-sm text-gray-600">Growth</p>
                      <p className="text-xl font-bold text-green-600">
                        {analysis.metrics.growth}%
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-md">
                      <p className="text-sm text-gray-600">Burn</p>
                      <p className="text-xl font-bold text-yellow-600">
                        €{analysis.metrics.burn.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-md">
                      <p className="text-sm text-gray-600">Runway</p>
                      <p className="text-xl font-bold text-purple-600">
                        {analysis.metrics.runway} months
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Valuation</h3>
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <p><span className="font-medium">Pre-Money:</span> €{analysis.valuation.preMoney.toLocaleString()}</p>
                    <p><span className="font-medium">Post-Money:</span> €{analysis.valuation.postMoney.toLocaleString()}</p>
                    <p className="text-gray-600">{analysis.valuation.rationale}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Analysis</h3>
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <p><span className="font-medium">TAM:</span> €{analysis.market.tam.toLocaleString()}</p>
                    <p><span className="font-medium">SAM:</span> €{analysis.market.sam.toLocaleString()}</p>
                    <p><span className="font-medium">SOM:</span> €{analysis.market.som.toLocaleString()}</p>
                    <p className="text-gray-600">{analysis.market.analysis}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Risks</h3>
                    <ul className="space-y-2">
                      {analysis.risks.map((risk, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-red-500 mr-2">⚠️</span>
                          <span className="text-gray-700">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Opportunities</h3>
                    <ul className="space-y-2">
                      {analysis.opportunities.map((opp, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-gray-700">{opp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
