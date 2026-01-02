'use client';

import { useState } from 'react';

interface Document {
  id: string;
  fileName: string;
  fileSize: number;
  type: string;
  content: string;
  uploadProgress: number;
}

interface AnalysisResult {
  founders: Array<{ name: string; email: string }>;
  metrics: { revenue: number; growth: number; burn: number; runway: number };
  valuation: { preMoney: number; postMoney: number; rationale: string };
  market: { tam: number; sam: number; som: number; analysis: string };
  risks: string[];
  opportunities: string[];
  summary: string;
  extractedData?: any;
  dataQuality?: {
    score: number;
    completeness: number;
    confidence: number;
    warnings: string[];
  };
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];

export default function SimpleMVP() {
  const [investment, setInvestment] = useState({
    companyName: '',
    sector: '',
    stage: 'SEED',
    committedCapital: '',
    currency: 'EUR', localEquivalent: '',
  });

  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showReviewPopup, setShowReviewPopup] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setInvestment({ ...investment, [e.target.name]: e.target.value });
    setError('');
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type "${file.type}" is not supported. Please upload PDF, DOC, DOCX, TXT, XLS, or XLSX files.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" exceeds the 10MB limit.`;
    }
    return null;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const newDocs: Document[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const validationError = validateFile(file);
        
        if (validationError) {
          setError(validationError);
          setUploading(false);
          return;
        }

        const content = await fileToBase64(file);
        newDocs.push({
          id: Math.random().toString(36).substr(2, 9),
          fileName: file.name,
          fileSize: file.size,
          type: file.type,
          content,
          uploadProgress: 100,
        });

        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      setDocuments([...documents, ...newDocs]);
      setSuccess(`Successfully uploaded ${newDocs.length} document(s)`);
    } catch (err: any) {
      setError('Failed to upload files: ' + err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
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
    setSuccess('Document removed');
  };

  const createInvestment = async () => {
    if (!investment.companyName || !investment.committedCapital || !investment.localEquivalent) {
      setError('Please fill in required fields (Company Name, Committed Capital, and Local Equivalent)');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      
      const response = await fetch(`${BACKEND_URL}/api/investments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investment: {
            ...investment,
            committedCapitalLcl: parseFloat(investment.committedCapital),
            currentFairValueEur: parseFloat(investment.localEquivalent),
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
        const errorData = await response.json();
        const errorMessage = errorData.error?.message \|\| errorData.error \|\| errorData.message \|\| JSON.stringify\(errorData\);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setSuccess('Investment created successfully! ID: ' + result.id);
      
      // Clear form after successful creation
      setInvestment({
        companyName: '',
        sector: '',
        stage: 'SEED',
        committedCapital: '',
        currency: 'EUR',
        localEquivalent: '',
      });
      setDocuments([]);
      setAnalysis(null);
    } catch (err: any) {
      setError('Failed to create investment: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const analyzeWithChatGPT = async () => {
    if (documents.length === 0) {
      setError('Please upload at least one document to analyze');
      return;
    }

    setAnalyzing(true);
    setError('');
    setSuccess('');

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
            companyName: investment.companyName || 'Unknown Company',
            sector: investment.sector || 'Unknown',
            stage: investment.stage,
            committedCapitalLcl: parseFloat(investment.committedCapital) || 0,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze documents');
      }

      const result = await response.json();
      setAnalysis(result.analysis);
      setSuccess('Analysis completed successfully!');
    } catch (err: any) {
      setError('Failed to analyze: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const createAndAnalyze = async () => {
    if (!investment.companyName || !investment.committedCapital || !investment.localEquivalent) {
      setError('Please fill in required fields (Company Name, Committed Capital, and Local Equivalent)');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      
      const response = await fetch(`${BACKEND_URL}/api/investments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investment: {
            ...investment,
            committedCapitalLcl: parseFloat(investment.committedCapital),
            currentFairValueEur: parseFloat(investment.localEquivalent),
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
        const errorData = await response.json();
        const errorMessage = errorData.error?.message \|\| errorData.error \|\| errorData.message \|\| JSON.stringify\(errorData\);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setSuccess('Investment created successfully! ID: ' + result.id);

      if (documents.length > 0) {
        setAnalyzing(true);
        const analyzeResponse = await fetch(`${BACKEND_URL}/api/review/analyze-direct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            investmentId: result.id,
            documents: documents.map((doc) => ({
              fileName: doc.fileName,
              type: 'PITCH_DECK',
              content: doc.content,
            })),
            investment: {
              companyName: investment.companyName,
              sector: investment.sector,
              stage: investment.stage,
              committedCapitalLcl: parseFloat(investment.committedCapital),
            },
          }),
        });

        if (analyzeResponse.ok) {
          const analyzeResult = await analyzeResponse.json();
          setAnalysis(analyzeResult.analysis);
          setShowReviewPopup(true);
        }
        setAnalyzing(false);
      }

      setInvestment({
        companyName: '',
        sector: '',
        stage: 'SEED',
        committedCapital: '',
        currency: 'EUR',
        localEquivalent: '',
      });
      setDocuments([]);
    } catch (err: any) {
      setError('Failed to create investment: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const exportToJSON = () => {
    if (!analysis) return;

    const exportData = {
      investment,
      documents: documents.map(d => ({ fileName: d.fileName, fileSize: d.fileSize })),
      analysis,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${investment.companyName || 'investment'}-analysis.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccess('Analysis exported to JSON');
  };

  const resetForm = () => {
    setInvestment({
      companyName: '',
      sector: '',
      stage: 'SEED',
      committedCapital: '',
      currency: 'EUR',
      localEquivalent: '',
    });
    setDocuments([]);
    setAnalysis(null);
    setError('');
    setSuccess('');
    setShowReviewPopup(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Successful Deal Closed</h1>
            <p className="text-gray-600">Create and record investments profile with one-click</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 text-green-700 px-4 py-3 rounded">
              <div className="flex">
                <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p>{success}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name (legal entity) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={investment.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g., TechStartup Inc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector
                </label>
                <select
                  name="sector"
                  value={investment.sector}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">Select a sector</option>
                  <option value="AI and ML">AI and ML</option>
                  <option value="Fintech">Fintech</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="SaaS">SaaS</option>
                  <option value="Consumer Tech">Consumer Tech</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Cloud">Cloud</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="CleanTech">CleanTech</option>
                  <option value="EdTech">EdTech</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Robotics">Robotics</option>
                  <option value="Blockchain">Blockchain</option>
                  <option value="Telecom">Telecom</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="AgriTech">AgriTech</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stage
                </label>
                <select
                  name="stage"
                  value={investment.stage}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                  Committed Capital (Local) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="committedCapital"
                  value={investment.committedCapital}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g., 500000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={investment.currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="CHF">CHF</option>
                  <option value="SEK">SEK</option>
                  <option value="NOK">NOK</option>
                  <option value="DKK">DKK</option>
                  <option value="PLN">PLN</option>
                  <option value="CZK">CZK</option>
                  <option value="HUF">HUF</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Local Equivalent (EUR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="localEquivalent"
                  value={investment.localEquivalent}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g., 500000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Documents
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
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
                        accept=".pdf,.doc,.docx,.txt"
                        className="sr-only"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT up to 10MB each</p>
                  {uploading && uploadProgress > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{uploadProgress}% uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {documents.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Uploaded Documents ({documents.length})
                </h3>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <svg
                          className="h-5 w-5 text-gray-400 flex-shrink-0"
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
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {(doc.fileSize / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeDocument(doc.id)}
                        className="ml-3 text-red-600 hover:text-red-800 flex-shrink-0"
                        disabled={uploading}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={createAndAnalyze}
                disabled={uploading || !investment.companyName || !investment.committedCapital || !investment.localEquivalent}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {uploading ? 'Creating & Analyzing...' : 'Create Investment & Analyze Documents'}
              </button>

              <button
                onClick={resetForm}
                disabled={uploading || analyzing}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Reset
              </button>
            </div>
          </div>

          {analysis && (
            <div className="mt-8 border-t pt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">ChatGPT Analysis</h2>
                <button
                  onClick={exportToJSON}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  Export JSON
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{analysis.summary}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Founders</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {analysis.founders.map((founder, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-md">
                        <p className="font-medium text-gray-900">{founder.name}</p>
                        <p className="text-sm text-gray-600">{founder.email}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Metrics</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                          <span className="text-red-500 mr-2 flex-shrink-0">⚠️</span>
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
                          <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                          <span className="text-gray-700">{opp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showReviewPopup && analysis && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Investment Review</h2>
                    <button
                      onClick={() => setShowReviewPopup(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {analysis.dataQuality && (
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Quality Assessment</h3>
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Overall Score</p>
                          <p className="text-2xl font-bold text-blue-600">{analysis.dataQuality.score}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Completeness</p>
                          <p className="text-2xl font-bold text-green-600">{analysis.dataQuality.completeness}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Confidence</p>
                          <p className="text-2xl font-bold text-purple-600">{analysis.dataQuality.confidence}%</p>
                        </div>
                      </div>
                      {analysis.dataQuality.warnings.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Warnings:</p>
                          <ul className="space-y-1">
                            {analysis.dataQuality.warnings.map((warning, idx) => (
                              <li key={idx} className="text-sm text-yellow-700 flex items-start">
                                <span className="mr-2">⚠️</span>
                                {warning}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {analysis.extractedData && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Extracted Data</h3>
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(analysis.extractedData, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowReviewPopup(false)}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                    >
                      Confirm & Save
                    </button>
                    <button
                      onClick={() => setShowReviewPopup(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                    >
                      Edit Data
                    </button>
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







