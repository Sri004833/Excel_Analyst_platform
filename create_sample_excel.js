import xlsx from 'xlsx';
import path from 'path';

const data = [
  { "Order ID": 1001, "Product": "Wireless Mouse", "Category": "Accessories", "Price": 25.99, "Quantity": 3, "Revenue": 77.97, "Order Date": "2026-08-01", "Country": "USA", "Customer Satisfaction": 5 },
  { "Order ID": 1002, "Product": "Mechanical Keyboard", "Category": "Accessories", "Price": 89.99, "Quantity": 1, "Revenue": 89.99, "Order Date": "2026-08-02", "Country": "Canada", "Customer Satisfaction": 4 },
  { "Order ID": 1003, "Product": "32-inch Monitor", "Category": "Electronics", "Price": 299.99, "Quantity": 2, "Revenue": 599.98, "Order Date": "2026-08-02", "Country": "USA", "Customer Satisfaction": null },
  { "Order ID": 1004, "Product": "USB-C Hub", "Category": "Accessories", "Price": 45.00, "Quantity": 5, "Revenue": 225.00, "Order Date": "2026-08-03", "Country": "UK", "Customer Satisfaction": 5 },
  { "Order ID": 1005, "Product": "Noise Cancelling Headphones", "Category": "Electronics", "Price": 199.99, "Quantity": 1, "Revenue": 199.99, "Order Date": "2026-08-04", "Country": "Germany", "Customer Satisfaction": 3 },
  { "Order ID": 1006, "Product": "Wireless Mouse", "Category": "Accessories", "Price": 25.99, "Quantity": 2, "Revenue": 51.98, "Order Date": "2026-08-05", "Country": "USA", "Customer Satisfaction": 4 },
  { "Order ID": 1007, "Product": "Ergonomic Office Chair", "Category": "Furniture", "Price": 349.50, "Quantity": 1, "Revenue": 349.50, "Order Date": "2026-08-06", "Country": "UK", "Customer Satisfaction": 5 },
  { "Order ID": 1008, "Product": "Standing Desk", "Category": "Furniture", "Price": 499.00, "Quantity": 1, "Revenue": 499.00, "Order Date": "2026-08-07", "Country": "Canada", "Customer Satisfaction": null },
  { "Order ID": 1009, "Product": "Mechanical Keyboard", "Category": "Accessories", "Price": 89.99, "Quantity": 2, "Revenue": 179.98, "Order Date": "2026-08-08", "Country": "Germany", "Customer Satisfaction": 4 },
  { "Order ID": 1010, "Product": "Bluetooth Speaker", "Category": "Electronics", "Price": 59.99, "Quantity": 4, "Revenue": 239.96, "Order Date": "2026-08-09", "Country": "France", "Customer Satisfaction": 5 },
  { "Order ID": 1011, "Product": "HD Webcam", "Category": "Electronics", "Price": 79.99, "Quantity": 1, "Revenue": 79.99, "Order Date": "2026-08-10", "Country": "France", "Customer Satisfaction": 2 },
  { "Order ID": 1012, "Product": "USB-C Hub", "Category": "Accessories", "Price": 45.00, "Quantity": 1, "Revenue": 45.00, "Order Date": "2026-08-11", "Country": "USA", "Customer Satisfaction": 4 }
];

// Create workbook and worksheet
const worksheet = xlsx.utils.json_to_sheet(data);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, "Sales_Data");

// Write to file
const outputPath = path.resolve("Sample_Sales_Data.xlsx");
xlsx.writeFile(workbook, outputPath);
console.log(`[SAMPLE GENERATOR] Successfully generated: ${outputPath}`);
