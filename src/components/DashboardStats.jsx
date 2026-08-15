import React from 'react';
import { Columns, Rows, HardDrive, Percent } from 'lucide-react';
import './DashboardStats.css';

export default function DashboardStats({ dataset }) {
  if (!dataset) return null;

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const numericCount = dataset.columns?.filter(c => c.type === 'numeric').length || 0;
  const categoricalCount = dataset.columns?.filter(c => c.type === 'categorical').length || 0;

  return (
    <div className="stats-grid grid-4 animate-fade-in">
      <div className="stats-card glass-panel">
        <div className="stats-icon-wrapper primary-glow">
          <Rows className="stats-icon text-primary" />
        </div>
        <div className="stats-info">
          <span className="stats-label">Total Rows</span>
          <h3 className="stats-value">{dataset.rowCount?.toLocaleString() || 0}</h3>
        </div>
      </div>

      <div className="stats-card glass-panel">
        <div className="stats-icon-wrapper secondary-glow">
          <Columns className="stats-icon text-secondary" />
        </div>
        <div className="stats-info">
          <span className="stats-label">Total Columns</span>
          <h3 className="stats-value">{dataset.columnCount || 0}</h3>
        </div>
      </div>

      <div className="stats-card glass-panel">
        <div className="stats-icon-wrapper success-glow">
          <HardDrive className="stats-icon text-success" />
        </div>
        <div className="stats-info">
          <span className="stats-label">File Size</span>
          <h3 className="stats-value">{formatBytes(dataset.fileSize)}</h3>
        </div>
      </div>

      <div className="stats-card glass-panel">
        <div className="stats-icon-wrapper purple-glow">
          <Percent className="stats-icon text-purple" />
        </div>
        <div className="stats-info">
          <span className="stats-label">Column Types</span>
          <h3 className="stats-value">{numericCount} Num / {categoricalCount} Cat</h3>
        </div>
      </div>
    </div>
  );
}
