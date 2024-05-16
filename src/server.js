const express = require("express");
const mysql = require("mysql");

const app = express();

const dbConfig = {
  host: "sql6.freesqldatabase.com",
  port: "3306",
  user: "sql6705955",
  password: "3mkhMdIBTH",
  database: "sql6705955",
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Test the database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to MySQL database");
  connection.release(); // Release the connection
});

// Define a route to fetch data from the database
app.get("/data", (req, res) => {
  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection from pool:", err);
      res.status(500).json({ error: "Error getting connection from pool" });
      return;
    }

    // Execute the query to fetch data
    connection.query("SELECT * FROM student_data", (err, results) => {
      connection.release(); // Release the connection

      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: "Error executing query" });
        return;
      }

      // Send the fetched data as JSON response
      res.json(results);
    });
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
