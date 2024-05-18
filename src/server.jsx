const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
const port = 5000; // Or whatever port you're using for your server

// Enable CORS middleware
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

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

    // Define a function to get unique subjects from the list_of_subjects table
    const getUniqueSubjects = () => {
      return new Promise((resolve, reject) => {
        connection.query(
          `SELECT DISTINCT subject FROM list_of_subjects`,
          (err, results) => {
            if (err) {
              return reject(err);
            }
            resolve(results.map((row) => row.subject));
          }
        );
      });
    };

    // Get unique values for course, year, shift, section, and unique subjects
    Promise.all([
      getUniqueValues("section"),
      getUniqueValues("shift"),
      getUniqueValues("course"),
      getUniqueValues("year"),
      getUniqueSubjects(),
    ])
      .then(([sections, shifts, courses, years, subjects]) => {
        connection.release(); // Release the connection
        res.json({
          section: sections,
          shift: shifts,
          course: courses,
          year: years,
          subject: subjects,
        });
      })
      .catch((err) => {
        connection.release(); // Release the connection
        console.error("Error executing query:", err);
        res.status(500).json({ error: "Error executing query" });
      });
  });
});

// Define a new route to create a class and update class history
// Define a new route to create a class and update class history
app.post("/create-class", (req, res) => {
  const { className, email } = req.body; // Destructure className and email from req.body

  if (!className || !email) {
    return res.status(400).json({ error: "className and email are required." });
  }

  // Extract course, shift, year, section, and subject from className
  const [course, shift, year, section, subject] = className.split('_');

  const tableName = `${course}_${shift}_${year}_${section}_${subject}`;

  // SQL query to create a new table
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      attendance_date DATE NOT NULL,
      status VARCHAR(10) NOT NULL
    )
  `;

  // SQL query to insert into class_history
  const insertHistoryQuery = `
    INSERT INTO class_history (teacher_email, class_created)
    VALUES (?, ?)
  `;

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection from pool:", err);
      return res
        .status(500)
        .json({ error: "Error getting connection from pool" });
    }

    // Execute the queries in a transaction
    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        console.error("Error starting transaction:", err);
        return res.status(500).json({ error: "Error starting transaction" });
      }

      connection.query(createTableQuery, (err) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            console.error("Error creating table:", err);
            return res.status(500).json({ error: "Error creating table" });
          });
        }

        connection.query(insertHistoryQuery, [email, tableName], (err) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              console.error("Error inserting into class_history:", err);
              return res
                .status(500)
                .json({ error: "Error inserting into class_history" });
            });
          }

          connection.commit((err) => {
            connection.release();
            if (err) {
              console.error("Error committing transaction:", err);
              return res
                .status(500)
                .json({ error: "Error committing transaction" });
            }

            res.status(200).json({ message: "Class created successfully" });
          });
        });
      });
    });
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
