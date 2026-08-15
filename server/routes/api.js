import express from 'express';
import multer from 'multer';
import { parseExcel } from '../services/statsService.js';
import { saveDataset, getDatasets, getDatasetById, deleteDataset } from '../services/storageService.js';

const router = express.Router();

// Setup Multer memory storage (files are parsed directly from buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB file size limit
  }
});

/**
 * POST /api/upload
 * Accepts an Excel file, parses it, calculates statistics, and saves it.
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please upload a file.' });
    }

    // Validate extension
    const originalName = req.file.originalname;
    const fileExtension = originalName.split('.').pop().toLowerCase();
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
      return res.status(400).json({ error: 'Invalid file extension. Only Excel files (.xlsx, .xls) are supported.' });
    }

    console.log(`[API] File received: ${originalName} (${(req.file.size / 1024).toFixed(1)} KB)`);

    // Parse Excel workbook from buffer and run calculations
    const processedDataset = parseExcel(req.file.buffer, originalName);
    processedDataset.fileSize = req.file.size;

    // Save using the database service
    const savedRecord = await saveDataset(processedDataset);

    // Return metadata without raw data points to speed up client responses
    const responseData = {
      _id: savedRecord._id,
      name: savedRecord.name,
      rowCount: savedRecord.rowCount,
      columnCount: savedRecord.columnCount,
      fileSize: savedRecord.fileSize,
      columns: savedRecord.columns,
      summaryStats: savedRecord.summaryStats,
      uploadDate: savedRecord.uploadDate,
      createdAt: savedRecord.createdAt,
      updatedAt: savedRecord.updatedAt
    };

    res.status(201).json(responseData);
  } catch (err) {
    console.error('[API] Excel upload processing error:', err);
    res.status(500).json({ error: err.message || 'An error occurred during Excel file processing.' });
  }
});

/**
 * GET /api/datasets
 * Returns metadata list of all uploaded datasets.
 */
router.get('/datasets', async (req, res) => {
  try {
    const list = await getDatasets();
    res.status(200).json(list);
  } catch (err) {
    console.error('[API] Retrieve datasets list failed:', err);
    res.status(500).json({ error: 'Could not fetch datasets list.' });
  }
});

/**
 * GET /api/datasets/:id
 * Returns complete dataset, including rows and computed statistics.
 */
router.get('/datasets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await getDatasetById(id);
    if (!record) {
      return res.status(404).json({ error: 'Requested dataset could not be found.' });
    }
    res.status(200).json(record);
  } catch (err) {
    console.error(`[API] Fetch dataset details failed for id: ${req.params.id}`, err);
    res.status(500).json({ error: 'Failed to retrieve dataset details.' });
  }
});

/**
 * DELETE /api/datasets/:id
 * Deletes a dataset.
 */
router.delete('/datasets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteDataset(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Dataset not found or already deleted.' });
    }
    res.status(200).json({ message: 'Dataset successfully removed.', id });
  } catch (err) {
    console.error(`[API] Delete dataset failed for id: ${req.params.id}`, err);
    res.status(500).json({ error: 'Could not delete dataset.' });
  }
});

export default router;
