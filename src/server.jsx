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
app.post("/create-class", (req, res) => {
  const { className, email } = req.body; // Destructure className and email from req.body

  if (!className || !email) {
    return res.status(400).json({ error: "className and email are required." });
  }

  // Extract course, shift, year, section, and subject from className
  const [course, shift, year, section, subject] = className.split("_");

  const tableName = `${course}_${shift}_${year}_${section}_${subject}`;

  // SQL query to create a new table with specified schema
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      enrollment_id BIGINT(20) AUTO_INCREMENT PRIMARY KEY,
      name TEXT NOT NULL
    )
  `;

  // SQL query to insert into class_history
  const insertHistoryQuery = `
    INSERT INTO class_history (teacher_email, class_created)
    VALUES (?, ?)
  `;

  // SQL query to fetch relevant data from student_data table
  const fetchDataQuery = `
    SELECT enrollment_id, name
    FROM student_data
    WHERE course = ? AND shift = ? AND year = ? AND section = ?
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

      // Create the new table
      connection.query(createTableQuery, (err) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            console.error("Error creating table:", err);
            return res.status(500).json({ error: "Error creating table" });
          });
        }

        // Insert into class_history
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

          // Fetch data from student_data
          connection.query(
            fetchDataQuery,
            [course, shift, year, section],
            (err, results) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  console.error("Error fetching data:", err);
                  return res.status(500).json({ error: "Error fetching data" });
                });
              }

              // Insert fetched data into the new table
              const insertDataQuery = `
                INSERT INTO ${tableName} (enrollment_id, name)
                VALUES ?
              `;
              const values = results.map((row) => [
                row.enrollment_id,
                row.name,
              ]);

              connection.query(insertDataQuery, [values], (err) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    console.error("Error inserting data:", err);
                    return res
                      .status(500)
                      .json({ error: "Error inserting data" });
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

                  res
                    .status(200)
                    .json({ message: "Class created successfully" });
                });
              });
            }
          );
        });
      });
    });
  });
});

// Define a route to fetch classes created by a specific email
app.get("/classes-by-email", (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email parameter is required." });
  }

  // SQL query to fetch classes created by the specified email
  const query = `
    SELECT class_created
    FROM class_history
    WHERE teacher_email = ?
  `;

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection from pool:", err);
      return res
        .status(500)
        .json({ error: "Error getting connection from pool" });
    }

    // Execute the query
    connection.query(query, [email], (err, results) => {
      connection.release(); // Release the connection

      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ error: "Error executing query" });
      }

      // Extract class names from the results
      const classes = results.map((row) => row.class_created);

      res.json({ classes });
    });
  });
});

// Define a route to delete a class table and its entry from class history
app.post("/delete-class", (req, res) => {
  const { className, email } = req.body; // Extract className and email from request body

  if (!className || !email) {
    return res.status(400).json({ error: "className and email are required." });
  }

  // Extract course, shift, year, section, and subject from className
  const [course, shift, year, section, subject] = className.split("_");

  const tableName = `${course}_${shift}_${year}_${section}_${subject}`;

  // SQL query to drop the class table
  const dropTableQuery = `
    DROP TABLE IF EXISTS ${tableName}
  `;

  // SQL query to delete entry from class history
  const deleteHistoryQuery = `
    DELETE FROM class_history
    WHERE teacher_email = ? AND class_created = ?
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

      // Drop the class table
      connection.query(dropTableQuery, (err) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            console.error("Error dropping table:", err);
            return res.status(500).json({ error: "Error dropping table" });
          });
        }

        // Delete entry from class history
        connection.query(deleteHistoryQuery, [email, tableName], (err) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              console.error("Error deleting from class history:", err);
              return res
                .status(500)
                .json({ error: "Error deleting from class history" });
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

            // Send response back to frontend
            res.status(200).json({ message: "Class deleted successfully" });
          });
        });
      });
    });
  });
});


// Define an internal route to handle class deletion
app.post("/delete-class-internal", (req, res) => {
  const { className, email } = req.body;

  if (!className || !email) {
    return res.status(400).json({ error: "className and email are required." });
  }

  // Extract course, shift, year, section, and subject from className
  const [course, shift, year, section, subject] = className.split("_");

  const tableName = `${course}_${shift}_${year}_${section}_${subject}`;

  // SQL query to drop the class table
  const dropTableQuery = `
    DROP TABLE IF EXISTS ${tableName}
  `;

  // SQL query to delete entry from class history
  const deleteHistoryQuery = `
    DELETE FROM class_history
    WHERE teacher_email = ? AND class_created = ?
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

      // Drop the class table
      connection.query(dropTableQuery, (err) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            console.error("Error dropping table:", err);
            return res.status(500).json({ error: "Error dropping table" });
          });
        }

        // Delete entry from class history
        connection.query(deleteHistoryQuery, [email, tableName], (err) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              console.error("Error deleting from class history:", err);
              return res
                .status(500)
                .json({ error: "Error deleting from class history" });
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

            // Send response back to frontend
            res.status(200).json({ message: "Class deleted successfully" });
          });
        });
      });
    });
  });
});

// Define a new route to collect attendance information
app.post("/mark-attendance", (req, res) => {
  // Log the entire request body
  console.log("Data received at /mark-attendance:", req.body);

  // Send the captured data back to the frontend
  res.status(200).json(req.body);
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
