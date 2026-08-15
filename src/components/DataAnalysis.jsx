import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BarChart2, Hash, AlignLeft, Info } from 'lucide-react';
import './DataAnalysis.css';

export default function DataAnalysis({ dataset }) {
  const [expandedCol, setExpandedCol] = useState(null);

  if (!dataset || !dataset.summaryStats) return null;

  const stats = dataset.summaryStats;
  const columns = dataset.columns || [];

  // Filter numeric and categorical columns
  const numericCols = columns.filter(c => c.type === 'numeric');
  const categoricalCols = columns.filter(c => c.type === 'categorical');

  const toggleExpand = (colName) => {
    setExpandedCol(prev => (prev === colName ? null : colName));
  };

  return (
    <div className="analysis-panel glass-panel animate-fade-in">
      <div className="analysis-header">
        <h3>Descriptive Data Analysis</h3>
        <p>Precomputed statistical details, data completeness, and distributions</p>
      </div>

      {/* Numeric Summary Table */}
      {numericCols.length > 0 && (
        <div className="numeric-comparison">
          <h4>Numeric Columns Comparison</h4>
          <div className="table-responsive-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Column Name</th>
                  <th className="text-right">Mean</th>
                  <th className="text-right">Median</th>
                  <th className="text-right">Min</th>
                  <th className="text-right">Max</th>
                  <th className="text-right">Std Dev</th>
                  <th className="text-right">Missing %</th>
                </tr>
              </thead>
              <tbody>
                {numericCols.map(col => {
                  const colStats = stats[col.name];
                  if (!colStats) return null;
                  return (
                    <tr key={col.name} className="comparison-row" onClick={() => toggleExpand(col.name)}>
                      <td className="font-semibold">{col.name}</td>
                      <td className="text-right">{colStats.mean?.toLocaleString()}</td>
                      <td className="text-right">{colStats.median?.toLocaleString()}</td>
                      <td className="text-right">{colStats.min?.toLocaleString()}</td>
                      <td className="text-right">{colStats.max?.toLocaleString()}</td>
                      <td className="text-right">{colStats.stdDev?.toLocaleString()}</td>
                      <td className={`text-right ${colStats.missingPercentage > 0 ? 'text-warn' : ''}`}>
                        {colStats.missingPercentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Column Accordion Details */}
      <div className="column-accordion-section">
        <h4>Detailed Column Metrics</h4>
        <div className="accordion-list">
          {columns.map(col => {
            const colStats = stats[col.name];
            const isExpanded = expandedCol === col.name;
            if (!colStats) return null;

            const isNum = col.type === 'numeric';
            const validPercent = ((colStats.validCount / colStats.totalCount) * 100).toFixed(0);

            return (
              <div 
                key={col.name} 
                className={`accordion-item glass-panel ${isExpanded ? 'is-expanded' : ''}`}
              >
                <div className="accordion-trigger" onClick={() => toggleExpand(col.name)}>
                  <div className="trigger-left">
                    {isNum ? <Hash className="col-type-icon text-primary" size={16} /> : <AlignLeft className="col-type-icon text-purple" size={16} />}
                    <span className="col-title-text">{col.name}</span>
                    <span className={`badge-type ${isNum ? 'badge-numeric' : 'badge-categorical'}`}>
                      {col.type}
                    </span>
                  </div>
                  <div className="trigger-right">
                    <span className="completeness-summary text-muted">
                      {validPercent}% Complete
                    </span>
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="accordion-content">
                    {/* Completeness Bar */}
                    <div className="completeness-bar-container">
                      <div className="bar-labels">
                        <span>Data Completeness ({colStats.validCount} / {colStats.totalCount} values)</span>
                        <span>{validPercent}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div 
                          className={`progress-bar-fill ${colStats.missingPercentage > 0 ? 'bg-warning-fill' : 'bg-primary-fill'}`} 
                          style={{ width: `${validPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="metrics-grid">
                      {isNum ? (
                        <>
                          <div className="metric-box">
                            <span className="metric-label">Mean</span>
                            <span className="metric-value">{colStats.mean?.toLocaleString()}</span>
                          </div>
                          <div className="metric-box">
                            <span className="metric-label">Median</span>
                            <span className="metric-value">{colStats.median?.toLocaleString()}</span>
                          </div>
                          <div className="metric-box">
                            <span className="metric-label">Min / Max</span>
                            <span className="metric-value">{colStats.min} &rarr; {colStats.max}</span>
                          </div>
                          <div className="metric-box">
                            <span className="metric-label">Std Deviation</span>
                            <span className="metric-value">{colStats.stdDev?.toLocaleString()}</span>
                          </div>
                          <div className="metric-box">
                            <span className="metric-label">Sum</span>
                            <span className="metric-value">{colStats.sum?.toLocaleString()}</span>
                          </div>
                          <div className="metric-box">
                            <span className="metric-label">Missing Values</span>
                            <span className="metric-value">{colStats.missingCount} ({colStats.missingPercentage}%)</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="metric-box">
                            <span className="metric-label">Unique Categories</span>
                            <span className="metric-value">{colStats.uniqueCount}</span>
                          </div>
                          <div className="metric-box">
                            <span className="metric-label">Mode (Most Frequent)</span>
                            <span className="metric-value-text truncate" title={colStats.mode}>{colStats.mode}</span>
                          </div>
                          <div className="metric-box">
                            <span className="metric-label">Total Record Count</span>
                            <span className="metric-value">{colStats.totalCount}</span>
                          </div>
                          <div className="metric-box">
                            <span className="metric-label">Missing Values</span>
                            <span className="metric-value">{colStats.missingCount} ({colStats.missingPercentage}%)</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Frequencies view for Categorical or distributions */}
                    {!isNum && colStats.frequencies && colStats.frequencies.length > 0 && (
                      <div className="frequencies-container">
                        <h5>Frequency Distribution (Top 10)</h5>
                        <div className="freq-list">
                          {colStats.frequencies.slice(0, 10).map((item, idx) => {
                            const ratio = colStats.validCount > 0 ? ((item.count / colStats.validCount) * 100).toFixed(1) : 0;
                            return (
                              <div key={idx} className="freq-item">
                                <div className="freq-info">
                                  <span className="freq-value truncate" title={item.value}>{item.value || '(empty)'}</span>
                                  <span className="freq-counts">{item.count} ({ratio}%)</span>
                                </div>
                                <div className="freq-bar-bg">
                                  <div 
                                    className="freq-bar-fill" 
                                    style={{ width: `${ratio}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
