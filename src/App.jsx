import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Upload, Trash2, LayoutDashboard, Database, 
  BarChart3, LineChart, FileText, Menu, X, PlusCircle, AlertCircle, RefreshCw 
} from 'lucide-react';
import UploadZone from './components/UploadZone';
import DashboardStats from './components/DashboardStats';
import DataTable from './components/DataTable';
import DataAnalysis from './components/DataAnalysis';
import DataVisualization from './components/DataVisualization';
import './App.css';

export default function App() {
  const [datasets, setDatasets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch all dataset headers on mount
  useEffect(() => {
    fetchDatasets();
  }, []);

  // Fetch full dataset when ID is selected
  useEffect(() => {
    if (selectedId) {
      fetchDatasetDetails(selectedId);
    } else {
      setSelectedDataset(null);
    }
  }, [selectedId]);

  const fetchDatasets = async () => {
    try {
      const res = await fetch('/api/datasets');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch datasets list.');
      setDatasets(data);
    } catch (err) {
      console.error(err);
      setError('Could not connect to Express API. Ensure backend is running.');
    }
  };

  const fetchDatasetDetails = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/datasets/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch dataset details.');
      setSelectedDataset(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error loading dataset details.');
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Avoid selecting the dataset when deleting
    if (!window.confirm('Are you sure you want to delete this dataset?')) return;

    try {
      const res = await fetch(`/api/datasets/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete dataset.');
      
      // Update local state
      setDatasets(prev => prev.filter(d => d._id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setSelectedDataset(null);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete dataset.');
    }
  };

  const handleUploadSuccess = (newId) => {
    fetchDatasets();
    setSelectedId(newId);
    setActiveTab('dashboard');
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <aside className={`sidebar glass-panel ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <FileSpreadsheet className="logo-icon glow-text" />
            <span className="logo-text">Excel Analytics</span>
          </div>
          <button className="mobile-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-content">
          <button 
            className={`new-upload-btn ${!selectedId ? 'active' : ''}`}
            onClick={() => { setSelectedId(null); setSelectedDataset(null); }}
          >
            <PlusCircle size={18} />
            <span>Upload New Excel</span>
          </button>

          <div className="dataset-list-section">
            <span className="section-title">Uploaded Datasets</span>
            {datasets.length === 0 ? (
              <div className="empty-sidebar-list">
                <p>No spreadsheets uploaded yet.</p>
              </div>
            ) : (
              <div className="dataset-list">
                {datasets.map(dataset => (
                  <div 
                    key={dataset._id}
                    className={`dataset-list-item ${selectedId === dataset._id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedId(dataset._id);
                      // Auto toggle mobile drawer close
                      if (window.innerWidth <= 768) setSidebarOpen(false);
                    }}
                  >
                    <div className="item-icon-wrapper">
                      <Database size={16} className="dataset-item-icon" />
                    </div>
                    <div className="item-details">
                      <span className="item-name truncate" title={dataset.name}>{dataset.name}</span>
                      <span className="item-meta">
                        {dataset.rowCount?.toLocaleString()} rows • {formatBytes(dataset.fileSize)}
                      </span>
                    </div>
                    <button 
                      className="delete-item-btn"
                      onClick={(e) => handleDelete(e, dataset._id)}
                      title="Delete dataset"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Workspace content */}
      <main className="main-content">
        <header className="main-header glass-panel">
          <div className="header-left">
            <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={22} />
            </button>
            
            {selectedDataset ? (
              <div className="active-dataset-meta">
                <h2>{selectedDataset.name}</h2>
                <span className="active-badge">Active Sheet</span>
              </div>
            ) : (
              <h2>Excel Data Hub</h2>
            )}
          </div>
          <div className="header-right">
            <button className="refresh-btn" onClick={fetchDatasets} title="Refresh dataset list">
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        <div className="workspace-scroll-area">
          {error && (
            <div className="error-alert animate-fade-in">
              <AlertCircle size={20} />
              <div className="alert-content">
                <strong>Connection Error</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Loader Overlay */}
          {loading ? (
            <div className="workspace-loader">
              <RefreshCw className="animate-spin text-primary" size={36} />
              <p>Analyzing spreadsheet entries and building summary tables...</p>
            </div>
          ) : !selectedId ? (
            /* Upload Screen */
            <div className="upload-screen-wrapper">
              <div className="welcome-banner">
                <h1>Transform Spreadsheet Data into Insights</h1>
                <p>
                  Upload your Microsoft Excel files (`.xlsx`, `.xls`) to instantly run statistical calculations, view, search, filter rows, and graph custom columns using interactive widgets.
                </p>
              </div>

              <UploadZone onUploadSuccess={handleUploadSuccess} />

              <div className="features-showcase grid-3">
                <div className="feature-card glass-panel">
                  <LayoutDashboard className="feat-icon text-primary" />
                  <h4>Smart Summary Stats</h4>
                  <p>Instantly computes mathematical averages, medians, standard deviation, missing cell metrics, and categorical counts.</p>
                </div>
                <div className="feature-card glass-panel">
                  <FileText className="feat-icon text-secondary" />
                  <h4>Responsive Table Explorer</h4>
                  <p>Interactively sort table columns, search text records, filter values, and page through massive spreadsheets.</p>
                </div>
                <div className="feature-card glass-panel">
                  <BarChart3 className="feat-icon text-purple" />
                  <h4>Dynamic Chart Builder</h4>
                  <p>Map columns to custom axes and visualize aggregations like Mean, Sum, or Counts in Bar, Line, Area, or Pie charts.</p>
                </div>
              </div>
            </div>
          ) : selectedDataset ? (
            /* Active Analysis Screens */
            <div className="active-dataset-workspace animate-fade-in">
              <DashboardStats dataset={selectedDataset} />

              {/* Navigation Tabs */}
              <div className="dashboard-navigation glass-panel">
                <button 
                  className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <LayoutDashboard size={16} />
                  <span>Overview</span>
                </button>
                <button 
                  className={`nav-tab ${activeTab === 'table' ? 'active' : ''}`}
                  onClick={() => setActiveTab('table')}
                >
                  <FileText size={16} />
                  <span>Data Table</span>
                </button>
                <button 
                  className={`nav-tab ${activeTab === 'analysis' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analysis')}
                >
                  <Database size={16} />
                  <span>Data Analysis</span>
                </button>
                <button 
                  className={`nav-tab ${activeTab === 'visual' ? 'active' : ''}`}
                  onClick={() => setActiveTab('visual')}
                >
                  <BarChart3 size={16} />
                  <span>Visualizations</span>
                </button>
              </div>

              {/* Tab Panels */}
              <div className="tab-panel-container">
                {activeTab === 'dashboard' && (
                  <div className="overview-tab-grid grid-2">
                    <DataVisualization dataset={selectedDataset} />
                    <DataAnalysis dataset={selectedDataset} />
                    <div style={{ gridColumn: 'span 2' }}>
                      <DataTable dataset={selectedDataset} />
                    </div>
                  </div>
                )}

                {activeTab === 'table' && (
                  <DataTable dataset={selectedDataset} />
                )}

                {activeTab === 'analysis' && (
                  <DataAnalysis dataset={selectedDataset} />
                )}

                {activeTab === 'visual' && (
                  <DataVisualization dataset={selectedDataset} />
                )}
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
