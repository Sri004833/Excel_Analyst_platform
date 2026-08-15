import xlsx from 'xlsx';

/**
 * Parses an Excel workbook buffer and extracts structured data, columns, and analytics.
 * @param {Buffer} fileBuffer - The uploaded Excel file buffer.
 * @param {string} fileName - The filename.
 * @returns {object} The structured dataset object.
 */
export function parseExcel(fileBuffer, fileName) {
  // Read workbook
  const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
  
  if (!workbook.SheetNames.length) {
    throw new Error('The uploaded Excel file contains no sheets.');
  }

  // Use the first sheet in the Excel file
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // Parse rows as JSON. Empty cells will fall back to null.
  const rawData = xlsx.utils.sheet_to_json(sheet, { defval: null });
  
  if (rawData.length === 0) {
    throw new Error('The Excel sheet is empty (contains no rows).');
  }

  // Discover all unique column keys (headers) across all rows
  const allKeys = new Set();
  rawData.forEach(row => {
    Object.keys(row).forEach(key => {
      // Remove empty keys or spacing
      if (key !== undefined && key !== null && key.trim() !== '') {
        allKeys.add(key.trim());
      }
    });
  });
  
  const columnNames = Array.from(allKeys);
  if (columnNames.length === 0) {
    throw new Error('No valid columns found in the Excel sheet.');
  }

  const columns = [];
  const summaryStats = {};

  // Analyze each column and calculate appropriate statistics
  columnNames.forEach(colName => {
    const values = rawData.map(row => row[colName]);
    const nonNullValues = values.filter(v => v !== null && v !== undefined && String(v).trim() !== '');

    // Classify column type.
    // If at least 80% of non-null values are numeric, we classify as numeric. Otherwise, categorical.
    let numericCount = 0;
    nonNullValues.forEach(v => {
      if (typeof v === 'number' || (!isNaN(v) && !isNaN(parseFloat(v)))) {
        numericCount++;
      }
    });

    const isNumeric = nonNullValues.length > 0 && (numericCount / nonNullValues.length >= 0.8);
    const colType = isNumeric ? 'numeric' : 'categorical';
    columns.push({ name: colName, type: colType });

    const totalCount = values.length;
    const missingCount = totalCount - nonNullValues.length;
    const missingPercentage = totalCount > 0 ? ((missingCount / totalCount) * 100) : 0;

    if (colType === 'numeric') {
      const numericValues = nonNullValues
        .map(v => (typeof v === 'number' ? v : parseFloat(v)))
        .filter(v => !isNaN(v));

      if (numericValues.length > 0) {
        numericValues.sort((a, b) => a - b);
        
        const sum = numericValues.reduce((s, val) => s + val, 0);
        const mean = sum / numericValues.length;
        
        // Median
        const mid = Math.floor(numericValues.length / 2);
        const median = numericValues.length % 2 !== 0 
          ? numericValues[mid] 
          : (numericValues[mid - 1] + numericValues[mid]) / 2;
          
        const min = numericValues[0];
        const max = numericValues[numericValues.length - 1];

        // Standard Deviation
        const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numericValues.length;
        const stdDev = Math.sqrt(variance);

        summaryStats[colName] = {
          type: 'numeric',
          totalCount,
          validCount: numericValues.length,
          missingCount,
          missingPercentage: parseFloat(missingPercentage.toFixed(2)),
          mean: parseFloat(mean.toFixed(4)),
          median: parseFloat(median.toFixed(4)),
          min: parseFloat(min.toFixed(4)),
          max: parseFloat(max.toFixed(4)),
          stdDev: parseFloat(stdDev.toFixed(4)),
          sum: parseFloat(sum.toFixed(4))
        };
      } else {
        summaryStats[colName] = {
          type: 'numeric',
          totalCount,
          validCount: 0,
          missingCount,
          missingPercentage: parseFloat(missingPercentage.toFixed(2)),
          mean: 0,
          median: 0,
          min: 0,
          max: 0,
          stdDev: 0,
          sum: 0
        };
      }
    } else {
      // Categorical Summary Statistics
      const frequencies = {};
      nonNullValues.forEach(v => {
        const key = String(v).trim();
        frequencies[key] = (frequencies[key] || 0) + 1;
      });

      const uniqueCount = Object.keys(frequencies).length;
      
      // Calculate mode (most frequent item)
      let mode = 'N/A';
      let maxFreq = 0;
      Object.entries(frequencies).forEach(([key, freq]) => {
        if (freq > maxFreq) {
          maxFreq = freq;
          mode = key;
        }
      });

      // Get top 15 most frequent categories
      const sortedFrequencies = Object.entries(frequencies)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);

      summaryStats[colName] = {
        type: 'categorical',
        totalCount,
        validCount: nonNullValues.length,
        missingCount,
        missingPercentage: parseFloat(missingPercentage.toFixed(2)),
        uniqueCount,
        mode,
        frequencies: sortedFrequencies
      };
    }
  });

  return {
    name: fileName,
    rowCount: rawData.length,
    columnCount: columns.length,
    columns,
    summaryStats,
    data: rawData
  };
}
