import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true } // 'numeric' or 'categorical'
});

const datasetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  rowCount: { type: Number, required: true },
  columnCount: { type: Number, required: true },
  fileSize: { type: Number, required: true }, // file size in bytes
  columns: [columnSchema],
  summaryStats: { type: Map, of: mongoose.Schema.Types.Mixed }, // statistics per column
  data: [mongoose.Schema.Types.Mixed] // raw JSON rows parsed from Excel
}, {
  timestamps: true
});

const Dataset = mongoose.model('Dataset', datasetSchema);

export default Dataset;
