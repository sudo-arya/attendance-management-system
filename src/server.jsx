const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
const port = 5000; // Or whatever port you're using for your server

// Enable CORS middleware
app.use(cors());

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

// Define a route to fetch unique values from the database
app.get("/unique-values", (req, res) => {
  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection from pool:", err);
      res.status(500).json({ error: "Error getting connection from pool" });
      return;
    }

    // Define a function to get unique values for a specific column
    const getUniqueValues = (column) => {
      return new Promise((resolve, reject) => {
        connection.query(
          `SELECT DISTINCT ${column} FROM student_data`,
          (err, results) => {
            if (err) {
              return reject(err);
            }
            resolve(results.map((row) => row[column]));
          }
        );
      });
    };

    // Get unique values for each column
    Promise.all([
      getUniqueValues("section"),
      getUniqueValues("shift"),
      getUniqueValues("course"),
      getUniqueValues("year"),
    ])
      .then(([sections, shifts, courses, years]) => {
        connection.release(); // Release the connection
        res.json({
          section: sections,
          shift: shifts,
          course: courses,
          year: years,
        });
      })
      .catch((err) => {
        connection.release(); // Release the connection
        console.error("Error executing query:", err);
        res.status(500).json({ error: "Error executing query" });
      });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
