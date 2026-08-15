import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, 
  ScatterChart, Scatter, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { BarChart3, LineChart as LineIcon, AreaChart as AreaIcon, PieChart as PieIcon, Activity } from 'lucide-react';
import './DataVisualization.css';

const CHART_COLORS = ['#6366f1', '#06b6d4', '#a855f7', '#10b981', '#f59e0b', '#f43f5e', '#ec4899', '#8b5cf6'];

export default function DataVisualization({ dataset }) {
  const [chartType, setChartType] = useState('bar');
  const [xAxisCol, setXAxisCol] = useState('');
  const [yAxisCol, setYAxisCol] = useState('');
  const [aggregation, setAggregation] = useState('average');

  if (!dataset || !dataset.columns || !dataset.data) return null;

  const columns = dataset.columns;
  const numericCols = columns.filter(c => c.type === 'numeric');

  // Auto-initialize axis selections on mount/load
  React.useEffect(() => {
    if (columns.length > 0) {
      // Find a categorical column for X axis (if none, first column)
      const cat = columns.find(c => c.type === 'categorical');
      setXAxisCol(cat ? cat.name : columns[0].name);

      // Find a numeric column for Y axis (if none, select none)
      if (numericCols.length > 0) {
        setYAxisCol(numericCols[0].name);
      } else {
        setYAxisCol('');
      }
    }
  }, [dataset]);

  // Aggregate and process data for charts
  const chartData = useMemo(() => {
    if (!xAxisCol || (!yAxisCol && aggregation !== 'count')) return [];

    const rawData = dataset.data;

    if (aggregation === 'none') {
      // Plot raw records (limit to 100 rows to prevent clutter/lag)
      return rawData.slice(0, 100).map((row, idx) => {
        const xVal = row[xAxisCol];
        const yVal = yAxisCol ? Number(row[yAxisCol]) : idx;
        return {
          name: xVal === null || xVal === undefined ? `Row ${idx + 1}` : String(xVal),
          value: isNaN(yVal) ? 0 : yVal
        };
      });
    }

    // Perform aggregation grouping by X-Axis values
    const groups = {};

    rawData.forEach(row => {
      let xVal = row[xAxisCol];
      if (xVal === null || xVal === undefined || String(xVal).trim() === '') {
        xVal = '(blank)';
      } else {
        xVal = String(xVal).trim();
      }

      if (!groups[xVal]) {
        groups[xVal] = { sum: 0, count: 0, vals: [] };
      }

      if (yAxisCol) {
        const yVal = Number(row[yAxisCol]);
        if (!isNaN(yVal)) {
          groups[xVal].sum += yVal;
          groups[xVal].vals.push(yVal);
        }
      }
      groups[xVal].count += 1;
    });

    const result = Object.entries(groups).map(([name, data]) => {
      let value = 0;
      if (aggregation === 'count') {
        value = data.count;
      } else if (aggregation === 'sum') {
        value = parseFloat(data.sum.toFixed(2));
      } else if (aggregation === 'average') {
        value = data.vals.length > 0 ? parseFloat((data.sum / data.vals.length).toFixed(2)) : 0;
      }

      return { name, value };
    });

    // Sort by value desc to make charts readable, limit to top 25 categories
    return result.sort((a, b) => b.value - a.value).slice(0, 25);
  }, [dataset.data, xAxisCol, yAxisCol, aggregation]);

  const customTooltipStyle = {
    background: 'rgba(15, 18, 32, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#f8fafc',
    fontFamily: 'Outfit, sans-serif',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(8px)',
  };

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="chart-placeholder">
          <Activity className="animate-spin text-muted" size={40} />
          <p>Please select valid X and Y axis columns to plot values.</p>
        </div>
      );
    }

    switch (chartType) {
      case 'line':
        return (
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={customTooltipStyle} />
            <Legend wrapperStyle={{ paddingTop: 10 }} />
            <Line 
              type="monotone" 
              dataKey="value" 
              name={yAxisCol ? `${yAxisCol} (${aggregation})` : `Count`} 
              stroke="#6366f1" 
              strokeWidth={3} 
              activeDot={{ r: 8 }} 
              dot={{ r: 4, strokeWidth: 2 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
            <defs>
              <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={customTooltipStyle} />
            <Legend wrapperStyle={{ paddingTop: 10 }} />
            <Area 
              type="monotone" 
              dataKey="value" 
              name={yAxisCol ? `${yAxisCol} (${aggregation})` : `Count`} 
              stroke="#06b6d4" 
              fillOpacity={1} 
              fill="url(#areaColor)" 
              strokeWidth={2.5}
            />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Tooltip contentStyle={customTooltipStyle} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', paddingTop: 10 }} />
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              labelLine={false}
              outerRadius={105}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis type="category" dataKey="name" name={xAxisCol} stroke="#94a3b8" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
            <YAxis type="number" dataKey="value" name={yAxisCol || 'Count'} stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={customTooltipStyle} />
            <Legend wrapperStyle={{ paddingTop: 10 }} />
            <Scatter name={yAxisCol ? `${yAxisCol} by ${xAxisCol}` : 'Count'} data={chartData} fill="#a855f7" />
          </ScatterChart>
        );

      case 'bar':
      default:
        return (
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={customTooltipStyle} />
            <Legend wrapperStyle={{ paddingTop: 10 }} />
            <Bar 
              dataKey="value" 
              name={yAxisCol ? `${yAxisCol} (${aggregation})` : `Count`} 
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        );
    }
  };

  return (
    <div className="chart-panel glass-panel animate-fade-in">
      <div className="chart-header">
        <div className="header-info">
          <h3>Visual Data Explorer</h3>
          <p>Generate clean, dynamic interactive charts from dataset attributes</p>
        </div>

        {/* Chart type controls */}
        <div className="chart-type-tabs">
          <button className={chartType === 'bar' ? 'active-tab' : ''} onClick={() => setChartType('bar')} title="Bar Chart">
            <BarChart3 size={16} />
          </button>
          <button className={chartType === 'line' ? 'active-tab' : ''} onClick={() => setChartType('line')} title="Line Chart">
            <LineIcon size={16} />
          </button>
          <button className={chartType === 'area' ? 'active-tab' : ''} onClick={() => setChartType('area')} title="Area Chart">
            <AreaIcon size={16} />
          </button>
          <button className={chartType === 'pie' ? 'active-tab' : ''} onClick={() => setChartType('pie')} title="Pie Chart">
            <PieIcon size={16} />
          </button>
          <button className={chartType === 'scatter' ? 'active-tab' : ''} onClick={() => setChartType('scatter')} title="Scatter Chart">
            <Activity size={16} />
          </button>
        </div>
      </div>

      <div className="chart-workspace">
        {/* Sidebar settings */}
        <div className="chart-settings">
          <div className="setting-group">
            <label>X-Axis (Dimension)</label>
            <select value={xAxisCol} onChange={(e) => setXAxisCol(e.target.value)}>
              {columns.map(c => (
                <option key={c.name} value={c.name}>{c.name} ({c.type})</option>
              ))}
            </select>
          </div>

          <div className="setting-group">
            <label>Y-Axis (Measure)</label>
            <select 
              value={yAxisCol} 
              onChange={(e) => setYAxisCol(e.target.value)}
              disabled={aggregation === 'count'}
            >
              <option value="">-- Select Column --</option>
              {numericCols.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="setting-group">
            <label>Aggregation Method</label>
            <select value={aggregation} onChange={(e) => setAggregation(e.target.value)}>
              <option value="average">Average (Mean)</option>
              <option value="sum">Sum</option>
              <option value="count">Count (Rows)</option>
              <option value="none">None (Plot raw rows)</option>
            </select>
          </div>

          <div className="chart-summary-alert">
            <p>
              Aggregation is grouped by X-axis distinct categories. Chart displays top 25 categories sorted by value.
            </p>
          </div>
        </div>

        {/* Recharts canvas */}
        <div className="chart-canvas">
          <ResponsiveContainer width="100%" height={320}>
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
