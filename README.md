# Excel Analytics Platform

An interactive MERN stack (MongoDB, Express, React, Node.js) web application designed to simplify the upload, extraction, mathematical analysis, and dynamic visualization of raw Excel spreadsheet datasets.

The platform features a premium **Deep Space Dark Theme** styled using glassmorphism, responsive grid layouts, custom navigation tabs, and fluid hover animations.

---

## 🚀 Key Features

*   **Excel Workbook Uploading:** Drag-and-drop or browse files (supports `.xlsx` and `.xls` formats up to 15MB).
*   **Automated Schema Extraction:** Parses rows, determines columns, and classifies data types (`numeric` vs. `categorical`).
*   **Descriptive Statistics Summary:** Automatically calculates:
    *   *Numeric columns:* Mean, Median, Min, Max, Standard Deviation, Sum, and Completeness Ratio.
    *   *Categorical columns:* Total record count, Mode (most frequent), and Unique Category counts.
*   **Interactive Spreadsheet Viewer:** Responsive data sheet with global text search filtering, column header sorting, data-type tags, and pagination.
*   **Detailed Analytics Panels:** Expandable accordions with data-completeness progress bars and horizontal frequency distributions for categories.
*   **Dynamic Visualizations Explorer:** Generates interactive **Bar, Line, Area, Scatter, and Pie charts** using **Recharts** with customizable axis mappings and aggregation groupings (Average, Sum, Count, None).
*   **Robust Database Adapter:** Automatically attempts connection to MongoDB. If offline or missing connection parameters, it activates a file-based fallback database writing locally or to serverless `/tmp` files.

---

## 🛠️ Technology Stack

*   **Frontend:** React (Vite, JS), Recharts (data visualizations), Lucide-React (icons).
*   **Backend:** Node.js, Express.js, Multer (file parsing middleware), XLSX (Excel worksheet parsing engine).
*   **Database:** MongoDB with Mongoose ODM (includes local JSON file database fallback wrapper).
*   **Styling:** Custom modern Vanilla CSS (using CSS variables, glassmorphism filters, flexbox/grid, and transition properties).

---

## 📂 Project Structure

```
excel-analytics-platform/
│
├── package.json               # Shared dependencies & concurrent execution scripts
├── vite.config.js             # Vite configuration with API reverse proxy
├── vercel.json                # Vercel deployment and serverless routes routing
├── .vercelignore              # Deployment file filters
├── index.html                 # Main entry page containing Outfit font import
├── .env                       # Environment credentials (port and db URI)
├── create_sample_excel.js     # Script generating mock sales data for testing
│
├── src/                       # React Frontend Application
│   ├── main.jsx              # React mounting root
│   ├── App.jsx               # Dashboard scaffold and global state hub
│   ├── App.css               # Core layout and typography styles
│   ├── index.css             # Main styling system variables and glass panel properties
│   └── components/
│       ├── UploadZone.jsx    # Drag-and-drop Excel files uploader (with styles)
│       ├── DashboardStats.jsx# KPI stats tiles (with styles)
│       ├── DataTable.jsx     # Sortable, searchable data sheet (with styles)
│       ├── DataAnalysis.jsx  # Computed statistical summary panels (with styles)
│       └── DataVisualization.jsx # Responsive Recharts controller (with styles)
│
└── server/                    # Node.js + Express API Backend
    ├── index.js              # Server initialization and middleware parameters
    ├── config/
    │   └── db.js             # MongoDB connection manager and fallback toggle
    ├── models/
    │   └── Dataset.js        # Mongoose data schema
    ├── routes/
    │   └── api.js            # Router registering API endpoints
    ├── services/
    │   ├── statsService.js   # Workbook mathematical calculations
    │   └── storageService.js # Repository helper wrapping Mongoose and file DBs
    └── data/
        └── local_db.json     # File-based database (used if MongoDB is not present)
```

---

## 💻 Local Setup and Installation

### Prerequisites
Make sure you have **Node.js** installed on your computer.

### Step 1: Install Dependencies
Open a terminal in the root project folder and run:
```bash
npm install
```

### Step 2: Generate Sample Test Data
To create a mock spreadsheet (`Sample_Sales_Data.xlsx`) containing sample revenue, quantities, locations, and satisfaction indexes for testing, run:
```bash
node create_sample_excel.js
```

### Step 3: Run the Application
Start the frontend and backend concurrently:
```bash
npm run dev
```
*   **React Dashboard UI:** runs at [http://localhost:5173](http://localhost:5173)
*   **Express API Server:** runs at [http://localhost:5000](http://localhost:5000)

Open your browser, navigate to the React UI link, and upload the generated `Sample_Sales_Data.xlsx` sheet.

---

## ☁️ Deploying to Vercel (Serverless)

The application is pre-configured to run out-of-the-box in serverless cloud environments like Vercel.

### Option A: Vercel Drag & Drop
1. Open the [Vercel Deployment Dashboard](https://vercel.com/import/drop).
2. Drag and drop the root `excel-analytics-platform` folder.
3. The newly added `.vercelignore` file will prevent local `node_modules` from uploading. Vercel will install the clean packages on its servers.

### Option B: Vercel Git Integration
1. Push this project to GitHub/GitLab.
2. Connect the repository in Vercel.
3. Vercel will automatically detect the Vite config and compile both the frontend and backend serverless endpoints.

### Persistent Database Configuration
*   **Serverless Ephemeral Storage:** On Vercel, if no MongoDB URI is set, the backend stores uploaded sheets in Vercel's temporary `/tmp` directory. Uploaded spreadsheets will be fully functional but will clear when the serverless function cold-starts.
*   **Connecting persistent MongoDB:** To store uploaded records permanently, create a free database cluster on **MongoDB Atlas**, copy the connection string, and add it as an Environment Variable named `MONGODB_URI` in your Vercel Project Settings.
  Live Project: https://excel-analyst-platform.vercel.app/
