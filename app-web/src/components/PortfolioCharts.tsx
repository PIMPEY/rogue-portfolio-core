'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

interface Investment {
  id: string;
  companyName: string;
  sector: string;
  stage: string;
  geography: string;
  status: 'GREEN' | 'AMBER' | 'RED';
  committedCapitalEur: number;
  deployedCapitalEur: number;
  currentFairValueEur: number;
  runway: number | null;
  grossMoic: string;
  investmentDate: string;
}

interface PortfolioChartsProps {
  investments: Investment[];
  onFilter: (type: 'sector' | 'stage' | 'geography' | 'status', value: string | null) => void;
  activeFilter: { type: 'sector' | 'stage' | 'geography' | 'status' | null; value: string | null };
}

const COLORS = {
  GREEN: '#10b981',
  AMBER: '#f59e0b',
  RED: '#ef4444',
  DEFAULT: ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#6366f1', '#84cc16', '#06b6d4']
};

export default function PortfolioCharts({ investments, onFilter, activeFilter }: PortfolioChartsProps) {
  const getSectorData = () => {
    const sectorCounts = investments.reduce((acc, inv) => {
      acc[inv.sector] = (acc[inv.sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sectorCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const getStageData = () => {
    const stageCounts = investments.reduce((acc, inv) => {
      acc[inv.stage] = (acc[inv.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stageCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const getGeographyData = () => {
    const geoCounts = investments.reduce((acc, inv) => {
      acc[inv.geography] = (acc[inv.geography] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(geoCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const getStatusData = () => {
    const statusCounts = investments.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const sectorData = getSectorData();
  const stageData = getStageData();
  const geographyData = getGeographyData();
  const statusData = getStatusData();

  // Calculate aggregate metrics
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalCommitted = investments.reduce((sum, inv) => sum + inv.committedCapitalEur, 0);
  const totalDeployed = investments.reduce((sum, inv) => sum + inv.deployedCapitalEur, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentFairValueEur, 0);
  const investmentsWithRunway = investments.filter(i => i.runway !== null);
  const avgRunway = investmentsWithRunway.length > 0
    ? investmentsWithRunway.reduce((sum, i) => sum + (i.runway || 0), 0) / investmentsWithRunway.length
    : 0;

  // Capital deployed by sector
  const sectorCapitalData = Object.entries(
    investments.reduce((acc, inv) => {
      acc[inv.sector] = (acc[inv.sector] || 0) + inv.deployedCapitalEur;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Runway distribution
  const runwayRanges = [
    { name: '0-6m', min: 0, max: 6, count: 0 },
    { name: '6-12m', min: 6, max: 12, count: 0 },
    { name: '12-18m', min: 12, max: 18, count: 0 },
    { name: '18-24m', min: 18, max: 24, count: 0 },
    { name: '24+m', min: 24, max: Infinity, count: 0 },
  ];

  investments.forEach(inv => {
    if (inv.runway !== null) {
      const range = runwayRanges.find(r => inv.runway! >= r.min && inv.runway! < r.max);
      if (range) range.count++;
    }
  });

  const runwayData = runwayRanges.filter(r => r.count > 0).map(r => ({ name: r.name, value: r.count }));

  // MOIC distribution
  const moicRanges = [
    { name: '<1x', min: 0, max: 1, count: 0, total: 0 },
    { name: '1-2x', min: 1, max: 2, count: 0, total: 0 },
    { name: '2-3x', min: 2, max: 3, count: 0, total: 0 },
    { name: '3-5x', min: 3, max: 5, count: 0, total: 0 },
    { name: '5x+', min: 5, max: Infinity, count: 0, total: 0 },
  ];

  investments.forEach(inv => {
    const moic = parseFloat(inv.grossMoic || '1.0');
    const range = moicRanges.find(r => moic >= r.min && moic < r.max);
    if (range) {
      range.count++;
      range.total += inv.deployedCapitalEur;
    }
  });

  const moicData = moicRanges.filter(r => r.count > 0).map(r => ({
    name: r.name,
    count: r.count,
    capital: r.total
  }));

  // Concentration risk - top 10 investments by capital
  const concentrationData = investments
    .sort((a, b) => b.deployedCapitalEur - a.deployedCapitalEur)
    .slice(0, 10)
    .map(inv => ({
      name: inv.companyName.length > 15 ? inv.companyName.substring(0, 15) + '...' : inv.companyName,
      value: inv.deployedCapitalEur,
      percentage: ((inv.deployedCapitalEur / totalDeployed) * 100).toFixed(1)
    }));

  // Vintage year analysis
  const vintageData = Object.entries(
    investments.reduce((acc, inv) => {
      const year = new Date(inv.investmentDate).getFullYear();
      if (!acc[year]) {
        acc[year] = { count: 0, deployed: 0, currentValue: 0 };
      }
      acc[year].count++;
      acc[year].deployed += inv.deployedCapitalEur;
      acc[year].currentValue += inv.currentFairValueEur;
      return acc;
    }, {} as Record<number, { count: number; deployed: number; currentValue: number }>)
  ).map(([year, data]) => ({
    year: year.toString(),
    count: data.count,
    deployed: data.deployed,
    moic: (data.currentValue / data.deployed).toFixed(2)
  })).sort((a, b) => parseInt(a.year) - parseInt(b.year));

  // Capital deployment efficiency
  const deploymentEfficiency = ((totalDeployed / totalCommitted) * 100).toFixed(1);

  // Portfolio Valuation Progression - track how portfolio value evolved over time
  const valuationProgressionData = investments
    .sort((a, b) => new Date(a.investmentDate).getTime() - new Date(b.investmentDate).getTime())
    .reduce((acc, inv, index) => {
      const prevCost = index > 0 ? acc[index - 1].costBasis : 0;
      const prevValue = index > 0 ? acc[index - 1].currentValue : 0;

      acc.push({
        date: new Date(inv.investmentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        costBasis: prevCost + inv.deployedCapitalEur,
        currentValue: prevValue + inv.currentFairValueEur,
        company: inv.companyName
      });

      return acc;
    }, [] as Array<{ date: string; costBasis: number; currentValue: number; company: string }>);

  // Fundraise Calendar - show expected fundraising timeline over 5 years
  const fundraiseCalendarData = (() => {
    const quarters: Record<string, number> = {};
    const now = new Date();

    // Generate quarters for next 5 years (20 quarters)
    for (let i = 0; i < 20; i++) {
      const quarterDate = new Date(now);
      quarterDate.setMonth(now.getMonth() + (i * 3));
      const quarterKey = `Q${Math.floor(quarterDate.getMonth() / 3) + 1} ${quarterDate.getFullYear()}`;
      quarters[quarterKey] = 0;
    }

    // Count companies expected to fundraise in each quarter
    investments.forEach(inv => {
      if (inv.runway !== null && inv.runway > 0) {
        const investmentDate = new Date(inv.investmentDate);
        const fundraiseDate = new Date(investmentDate);
        fundraiseDate.setMonth(investmentDate.getMonth() + inv.runway);

        // Determine which quarter this falls into
        const monthsFromNow = (fundraiseDate.getFullYear() - now.getFullYear()) * 12 +
                              (fundraiseDate.getMonth() - now.getMonth());
        const quarterIndex = Math.floor(monthsFromNow / 3);

        if (quarterIndex >= 0 && quarterIndex < 20) {
          const quarterDate = new Date(now);
          quarterDate.setMonth(now.getMonth() + (quarterIndex * 3));
          const quarterKey = `Q${Math.floor(quarterDate.getMonth() / 3) + 1} ${quarterDate.getFullYear()}`;
          if (quarters[quarterKey] !== undefined) {
            quarters[quarterKey]++;
          }
        }
      }
    });

    return Object.entries(quarters).map(([quarter, count]) => ({
      quarter,
      count
    }));
  })();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / investments.length) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">{data.value} investments ({percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percentage = ((value / investments.length) * 100).toFixed(0);
    
    if (parseFloat(percentage) < 5) return null;
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="black" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="11"
        fontWeight="500"
      >
        {name} ({percentage}%)
      </text>
    );
  };

  const handleClick = (type: 'sector' | 'stage' | 'geography' | 'status', value: string) => {
    if (activeFilter.type === type && activeFilter.value === value) {
      onFilter(type, null);
    } else {
      onFilter(type, value);
    }
  };

  const getSliceColor = (index: number, type: 'sector' | 'stage' | 'geography' | 'status', name: string) => {
    if (type === 'status') {
      return COLORS[name as keyof typeof COLORS] || COLORS.DEFAULT[0];
    }
    return COLORS.DEFAULT[index % COLORS.DEFAULT.length];
  };

  const isSliceActive = (type: 'sector' | 'stage' | 'geography' | 'status', name: string) => {
    return activeFilter.type === type && activeFilter.value === name;
  };

  return (
    <div className="mb-8 space-y-6">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Committed</h3>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalCommitted)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Deployed</h3>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalDeployed)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Current Portfolio Value</h3>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalCurrentValue)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Runway</h3>
          <div className="text-2xl font-bold text-gray-900">{avgRunway.toFixed(1)} months</div>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capital Deployed by Sector */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Capital Deployed by Sector</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sectorCapitalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `€${(value / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : 'N/A'} />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fundraise Calendar */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Fundraise Calendar (5Y)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={fundraiseCalendarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="quarter"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 10 }}
              />
              <YAxis />
              <Tooltip formatter={(value: number | undefined) => value !== undefined ? `${value} companies` : 'N/A'} />
              <Bar dataKey="count" fill="#8b5cf6" name="Expected Fundraises" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Advanced Analytics - Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MOIC Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">MOIC Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={moicData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number | undefined) => value !== undefined ? `${value} companies` : 'N/A'} />
              <Bar dataKey="count" fill="#10b981" name="Companies" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Concentration Risk */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top 10 Investments (Capital)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={concentrationData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => `€${(value / 1000000).toFixed(1)}M`} />
              <YAxis type="category" dataKey="name" width={120} />
              <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : 'N/A'} />
              <Bar dataKey="value" fill="#f59e0b" name="Deployed Capital" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vintage Year Analysis */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Vintage Year Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={vintageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" name="Investments" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600">
            <p>Capital Deployment: <span className="font-semibold">{deploymentEfficiency}%</span></p>
          </div>
        </div>
      </div>

      {/* Portfolio Valuation Progression */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Portfolio Valuation Progression</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={valuationProgressionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fontSize: 10 }}
            />
            <YAxis tickFormatter={(value) => `€${(value / 1000000).toFixed(1)}M`} />
            <Tooltip
              formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : 'N/A'}
              labelStyle={{ color: '#000' }}
            />
            <Line
              type="monotone"
              dataKey="costBasis"
              stroke="#9ca3af"
              strokeWidth={2}
              name="Cost Basis"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="currentValue"
              stroke="#10b981"
              strokeWidth={2}
              name="Current Value"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-gray-400"></div>
            <span className="text-gray-600">Cost Basis: {formatCurrency(totalDeployed)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-green-500"></div>
            <span className="text-gray-600">Current Value: {formatCurrency(totalCurrentValue)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">
              Unrealized Gain: {formatCurrency(totalCurrentValue - totalDeployed)}
              ({((totalCurrentValue / totalDeployed - 1) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Existing Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Geography</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={geographyData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              onClick={(data) => handleClick('geography', data.name)}
              cursor="pointer"
              label={CustomLabel}
            >
              {geographyData.map((entry, index) => {
                const isActive = isSliceActive('geography', entry.name);
                const cellProps: any = {
                  key: `cell-${index}`,
                  fill: getSliceColor(index, 'geography', entry.name),
                  opacity: isActive ? 1 : activeFilter.type === 'geography' ? 0.3 : 1,
                  strokeWidth: isActive ? 3 : 0
                };
                if (isActive) {
                  cellProps.stroke = '#000';
                }
                return <Cell {...cellProps} />;
              })}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-gray-600">
          {activeFilter.type === 'geography' && activeFilter.value && (
            <div className="flex items-center justify-between">
              <span>Filtered by:</span>
              <button
                onClick={() => onFilter('geography', null)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {activeFilter.value} ✕
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sector</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={sectorData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              onClick={(data) => handleClick('sector', data.name)}
              cursor="pointer"
              label={CustomLabel}
            >
              {sectorData.map((entry, index) => {
                const isActive = isSliceActive('sector', entry.name);
                const cellProps: any = {
                  key: `cell-${index}`,
                  fill: getSliceColor(index, 'sector', entry.name),
                  opacity: isActive ? 1 : activeFilter.type === 'sector' ? 0.3 : 1,
                  strokeWidth: isActive ? 3 : 0
                };
                if (isActive) {
                  cellProps.stroke = '#000';
                }
                return <Cell {...cellProps} />;
              })}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-gray-600">
          {activeFilter.type === 'sector' && activeFilter.value && (
            <div className="flex items-center justify-between">
              <span>Filtered by:</span>
              <button
                onClick={() => onFilter('sector', null)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {activeFilter.value} ✕
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Stage</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={stageData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              onClick={(data) => handleClick('stage', data.name)}
              cursor="pointer"
              label={CustomLabel}
            >
              {stageData.map((entry, index) => {
                const isActive = isSliceActive('stage', entry.name);
                const cellProps: any = {
                  key: `cell-${index}`,
                  fill: getSliceColor(index, 'stage', entry.name),
                  opacity: isActive ? 1 : activeFilter.type === 'stage' ? 0.3 : 1,
                  strokeWidth: isActive ? 3 : 0
                };
                if (isActive) {
                  cellProps.stroke = '#000';
                }
                return <Cell {...cellProps} />;
              })}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-gray-600">
          {activeFilter.type === 'stage' && activeFilter.value && (
            <div className="flex items-center justify-between">
              <span>Filtered by:</span>
              <button
                onClick={() => onFilter('stage', null)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {activeFilter.value} ✕
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              onClick={(data) => handleClick('status', data.name)}
              cursor="pointer"
              label={CustomLabel}
            >
              {statusData.map((entry, index) => {
                const isActive = isSliceActive('status', entry.name);
                const cellProps: any = {
                  key: `cell-${index}`,
                  fill: getSliceColor(index, 'status', entry.name),
                  opacity: isActive ? 1 : activeFilter.type === 'status' ? 0.3 : 1,
                  strokeWidth: isActive ? 3 : 0
                };
                if (isActive) {
                  cellProps.stroke = '#000';
                }
                return <Cell {...cellProps} />;
              })}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-gray-600">
          {activeFilter.type === 'status' && activeFilter.value && (
            <div className="flex items-center justify-between">
              <span>Filtered by:</span>
              <button
                onClick={() => onFilter('status', null)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {activeFilter.value} ✕
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
