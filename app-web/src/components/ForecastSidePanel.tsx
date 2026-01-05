'use client';

import { useState } from 'react';

interface ForecastSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  investmentId: string;
  onUpdate: () => void;
}

type Scenario = 'base' | 'bull' | 'bear';

export default function ForecastSidePanel({ isOpen, onClose, investmentId, onUpdate }: ForecastSidePanelProps) {
  const [scenario, setScenario] = useState<Scenario>('base');
  const [icPassword, setIcPassword] = useState('');
  const [showIcOverride, setShowIcOverride] = useState(false);
  const [adjustments, setAdjustments] = useState({
    revenueMultiplier: 1.0,
    cogsMultiplier: 1.0,
    opexMultiplier: 1.0,
    capexMultiplier: 1.0,
  });

  if (!isOpen) return null;

  const handleScenarioChange = (newScenario: Scenario) => {
    setScenario(newScenario);

    // Preset multipliers based on scenario
    switch (newScenario) {
      case 'bull':
        setAdjustments({
          revenueMultiplier: 1.3,
          cogsMultiplier: 0.9,
          opexMultiplier: 0.95,
          capexMultiplier: 1.1,
        });
        break;
      case 'bear':
        setAdjustments({
          revenueMultiplier: 0.7,
          cogsMultiplier: 1.1,
          opexMultiplier: 1.05,
          capexMultiplier: 0.8,
        });
        break;
      default:
        setAdjustments({
          revenueMultiplier: 1.0,
          cogsMultiplier: 1.0,
          opexMultiplier: 1.0,
          capexMultiplier: 1.0,
        });
    }
  };

  const handleIcAccess = () => {
    // Simple password check (in production, use proper auth)
    if (icPassword === 'ic2024') {
      setShowIcOverride(true);
    } else {
      alert('Invalid IC password');
    }
  };

  const handleApply = () => {
    // Apply adjustments logic would go here
    console.log('Applying adjustments:', adjustments, 'Scenario:', scenario);
    onUpdate();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Quick Adjustments</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Scenario Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Scenario
            </label>
            <div className="space-y-2">
              {(['base', 'bull', 'bear'] as Scenario[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleScenarioChange(s)}
                  className={`w-full px-4 py-3 text-left rounded-lg border-2 transition-all ${
                    scenario === s
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium capitalize">{s} Case</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {s === 'base' && 'Standard forecast assumptions'}
                    {s === 'bull' && 'Optimistic: +30% revenue, -10% costs'}
                    {s === 'bear' && 'Conservative: -30% revenue, +10% costs'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Multipliers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Metric Adjustments
            </label>
            <div className="space-y-4">
              {Object.entries(adjustments).map(([key, value]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700 capitalize">
                      {key.replace('Multiplier', '')}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {(value * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={value}
                    onChange={(e) =>
                      setAdjustments((prev) => ({
                        ...prev,
                        [key]: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>50%</span>
                    <span>100%</span>
                    <span>200%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IC Override Section */}
          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Investment Committee Override
            </label>
            {!showIcOverride ? (
              <div className="space-y-3">
                <input
                  type="password"
                  value={icPassword}
                  onChange={(e) => setIcPassword(e.target.value)}
                  placeholder="Enter IC password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleIcAccess}
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Access IC Controls
                </button>
                <p className="text-xs text-gray-500">
                  IC password required for advanced forecast overrides
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center text-green-600 text-sm mb-3">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  IC Access Granted
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    IC override controls enable direct modification of approved forecasts.
                    Changes will be logged for audit purposes.
                  </p>
                </div>
                <button
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  onClick={() => alert('IC override functionality - to be implemented')}
                >
                  Apply IC Override
                </button>
              </div>
            )}
          </div>

          {/* Apply Button */}
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={handleApply}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Apply Adjustments
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
