import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import './UploadZone.css';

export default function UploadZone({ onUploadSuccess }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls') {
      setError('Unsupported file type. Please upload an Excel sheet (.xlsx or .xls)');
      setSuccess(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse Excel workbook.');
      }

      setSuccess(true);
      // Wait briefly so user sees the success state animation
      setTimeout(() => {
        if (onUploadSuccess) {
          onUploadSuccess(data._id);
        }
      }, 1000);
    } catch (err) {
      setError(err.message || 'An error occurred while uploading the file.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="upload-container glass-panel animate-fade-in">
      <div 
        className={`upload-zone ${isDragActive ? 'drag-active' : ''} ${loading ? 'loading' : ''} ${success ? 'success' : ''} ${error ? 'error' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          className="file-input-hidden" 
          accept=".xlsx, .xls"
          onChange={handleChange}
          disabled={loading}
        />

        <div className="upload-content">
          {loading ? (
            <>
              <Loader2 className="upload-icon animate-spin text-primary" />
              <h3>Parsing Excel Sheets...</h3>
              <p>Extracting schema, calculating column summaries, and saving records</p>
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="upload-icon text-success" />
              <h3 className="text-success">Workbook Processed!</h3>
              <p>{fileName}</p>
            </>
          ) : error ? (
            <>
              <AlertTriangle className="upload-icon text-error" />
              <h3 className="text-error">Upload Failed</h3>
              <p className="error-text">{error}</p>
              <button className="retry-btn">Try Again</button>
            </>
          ) : (
            <>
              <UploadCloud className="upload-icon text-muted" />
              <h3>Drag &amp; Drop Excel File</h3>
              <p>Supports .xlsx and .xls formats (Max 15MB)</p>
              <span className="browse-badge">Browse Files</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
