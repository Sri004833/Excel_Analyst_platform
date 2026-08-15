import React, { useState, useMemo, useEffect } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import './DataTable.css';

export default function DataTable({ dataset }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Reset page number when dataset changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm('');
    setSortColumn('');
  }, [dataset]);

  if (!dataset || !dataset.data || dataset.data.length === 0) {
    return (
      <div className="table-empty glass-panel animate-fade-in">
        <p>No rows to display.</p>
      </div>
    );
  }

  // Get columns list
  const headers = dataset.columns || [];

  // Filter rows by global search term
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return dataset.data;
    
    const query = searchTerm.toLowerCase().trim();
    return dataset.data.filter(row => {
      return Object.values(row).some(val => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      });
    });
  }, [dataset.data, searchTerm]);

  // Sort rows
  const sortedRows = useMemo(() => {
    if (!sortColumn) return filteredRows;

    const type = headers.find(h => h.name === sortColumn)?.type;

    return [...filteredRows].sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      // Handle nulls/blanks
      const aIsNull = valA === null || valA === undefined || valA === '';
      const bIsNull = valB === null || valB === undefined || valB === '';

      if (aIsNull && bIsNull) return 0;
      if (aIsNull) return 1; // Put nulls at the end
      if (bIsNull) return -1;

      if (type === 'numeric') {
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortDirection === 'asc' ? numA - numB : numB - numA;
        }
      }

      // Default string compare
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRows, sortColumn, sortDirection, headers]);

  // Paginated Rows
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedRows.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedRows, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedRows.length / rowsPerPage) || 1;

  const handleSort = (colName) => {
    if (sortColumn === colName) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(colName);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="data-table-container glass-panel animate-fade-in">
      <div className="table-actions">
        <h3>Dataset Viewer</h3>
        
        <div className="search-box">
          <Search className="search-icon text-muted" />
          <input 
            type="text" 
            placeholder="Search rows..." 
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => { setSearchTerm(''); setCurrentPage(1); }}>&times;</button>
          )}
        </div>
      </div>

      <div className="table-responsive-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th className="row-number-header">#</th>
              {headers.map(col => (
                <th 
                  key={col.name} 
                  onClick={() => handleSort(col.name)}
                  className={`sortable-header ${sortColumn === col.name ? 'active-sort' : ''}`}
                >
                  <div className="header-cell-content">
                    <span className="col-name">{col.name}</span>
                    <span className="col-type-tag">{col.type === 'numeric' ? '123' : 'Abc'}</span>
                    <ArrowUpDown className="sort-icon" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row, index) => {
                const globalIndex = (currentPage - 1) * rowsPerPage + index + 1;
                return (
                  <tr key={index}>
                    <td className="row-number-cell">{globalIndex}</td>
                    {headers.map(col => {
                      const cellValue = row[col.name];
                      const isNull = cellValue === null || cellValue === undefined || String(cellValue).trim() === '';
                      return (
                        <td key={col.name} className={col.type === 'numeric' ? 'text-right' : ''}>
                          {isNull ? (
                            <span className="cell-null">-</span>
                          ) : typeof cellValue === 'number' ? (
                            cellValue.toLocaleString(undefined, { maximumFractionDigits: 4 })
                          ) : (
                            String(cellValue)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={headers.length + 1} className="no-results-cell">
                  No records matched your search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="table-pagination">
        <div className="pagination-info">
          Showing {sortedRows.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to{' '}
          {Math.min(currentPage * rowsPerPage, sortedRows.length)} of{' '}
          <span className="glow-text">{sortedRows.length.toLocaleString()}</span> entries
        </div>

        <div className="pagination-controls">
          <div className="rows-per-page">
            <span>Rows per page:</span>
            <select 
              value={rowsPerPage} 
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[10, 25, 50, 100].map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>

          <div className="page-buttons">
            <button 
              onClick={() => setCurrentPage(1)} 
              disabled={currentPage === 1}
              className="page-nav-btn"
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
              className="page-nav-btn"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            
            <span className="page-indicator">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages}
              className="page-nav-btn"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(totalPages)} 
              disabled={currentPage === totalPages}
              className="page-nav-btn"
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
