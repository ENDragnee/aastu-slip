// lib/db.js
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const caCertPath = path.join(process.cwd(), '/src/lib', 'ca.pem');
const caCert = fs.readFileSync(caCertPath);

const db = mysql.createPool({
  host: "mysql-27f574f7-slip-3245.j.aivencloud.com",
  user: "avnadmin",
  port: "13415",
  password: "AVNS_AGGNPH0eFXTMkokMR_f",
  database: "defaultdb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    ca: caCert,
    rejectUnauthorized: false
  },
});

// Test the connection
const testConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log('Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
};

// Only run the test in development
if (process.env.NODE_ENV === 'development') {
  testConnection();
}

export default db;