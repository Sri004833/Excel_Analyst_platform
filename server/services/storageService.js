import fs from 'fs';
import path from 'path';
import Dataset from '../models/Dataset.js';
import { isMongoConnected } from '../config/db.js';

const LOCAL_DB_PATH = process.env.VERCEL 
  ? '/tmp/local_db.json' 
  : path.resolve('server', 'data', 'local_db.json');

/**
 * Ensures the local database JSON directory and file exist.
 */
function ensureLocalDbFile() {
  const dir = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify({ datasets: [] }, null, 2), 'utf-8');
  }
}

/**
 * Reads local JSON database.
 */
function readLocalDb() {
  ensureLocalDbFile();
  try {
    const rawContent = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(rawContent);
  } catch (err) {
    console.error('[STORAGE] Error reading local JSON database:', err);
    return { datasets: [] };
  }
}

/**
 * Writes data back to the local JSON database.
 */
function writeLocalDb(data) {
  ensureLocalDbFile();
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[STORAGE] Error writing to local JSON database:', err);
  }
}

/**
 * Saves a parsed dataset to MongoDB or file fallback.
 */
export async function saveDataset(datasetObj) {
  if (isMongoConnected()) {
    const document = new Dataset(datasetObj);
    return await document.save();
  } else {
    const uniqueId = 'local_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    const now = new Date().toISOString();
    
    const record = {
      _id: uniqueId,
      ...datasetObj,
      uploadDate: now,
      createdAt: now,
      updatedAt: now
    };

    const db = readLocalDb();
    db.datasets.push(record);
    writeLocalDb(db);
    return record;
  }
}

/**
 * Returns metadata headers for all uploaded datasets (excludes raw data arrays for speed).
 */
export async function getDatasets() {
  if (isMongoConnected()) {
    // Exclude the 'data' field using mongoose query selector
    return await Dataset.find().select('-data').sort({ uploadDate: -1 });
  } else {
    const db = readLocalDb();
    // Return all files metadata and strip the raw row array
    return db.datasets
      .map(({ data, ...meta }) => meta)
      .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  }
}

/**
 * Returns complete dataset contents, including raw columns and precomputed statistics.
 */
export async function getDatasetById(id) {
  if (isMongoConnected()) {
    return await Dataset.findById(id);
  } else {
    const db = readLocalDb();
    const record = db.datasets.find(item => item._id === id);
    return record || null;
  }
}

/**
 * Deletes a dataset by its ID.
 */
export async function deleteDataset(id) {
  if (isMongoConnected()) {
    return await Dataset.findByIdAndDelete(id);
  } else {
    const db = readLocalDb();
    const index = db.datasets.findIndex(item => item._id === id);
    if (index === -1) return null;
    
    const [deletedRecord] = db.datasets.splice(index, 1);
    writeLocalDb(db);
    return deletedRecord;
  }
}
