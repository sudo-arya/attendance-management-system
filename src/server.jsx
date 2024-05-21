const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
const port = 5000; // Or whatever port you're using for your server

// Enable CORS middleware
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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

// In-memory store for dynamic endpoints and their expiration times
let dynamicEndpoints = {};

// Function to clean up expired endpoints
const cleanupExpiredEndpoints = () => {
  const now = Date.now();
  for (const endpoint in dynamicEndpoints) {
    if (dynamicEndpoints[endpoint] < now) {
      delete dynamicEndpoints[endpoint];
    }
  }
};

// Schedule the cleanup task to run every minute
setInterval(cleanupExpiredEndpoints, 60 * 1000);
let selectedClass; // Define selectedClass in the global scope

// Middleware to check if the dynamic endpoint is still valid
const validateDynamicEndpoint = (req, res, next) => {
  const endpoint = req.originalUrl.slice(1); // Remove the leading "/"
  if (dynamicEndpoints[endpoint]) {
    return next();
  } else {
    return res
      .status(404)
      .json({ error: "Qr has expired or does not exist." });
  }
};

// Route to capture QR code data and create a dynamic endpoint
app.post("/created-qr", (req, res) => {
  const { qrCodeData } = req.body;

  if (!qrCodeData) {
    return res.status(400).json({ error: "QR code data is required." });
  }

  // Split QR code data by slashes to get className, date, and randomString
  const qrCodeParts = qrCodeData.split("/");

  // Extract className, selectedDate, and randomString
  const classNameParts = qrCodeParts[0].split("-"); // Split className by dashes
  const yearSection = classNameParts.pop(); // Extract yearSection
  const className = classNameParts.join("-"); // Rejoin className without yearSection
  const selectedDate = qrCodeParts[1];
  const randomString = qrCodeParts[2];

  // Define the dynamic endpoint
  const dynamicEndpoint = `${className}-${yearSection}/${selectedDate}/${randomString}`;

  // Store the dynamic endpoint with an expiry time (2 minutes)
  dynamicEndpoints[dynamicEndpoint] = Date.now() + 2 * 60 * 1000; // 2 minutes from now

  console.log(`Dynamic Endpoint: http://localhost:${port}/${dynamicEndpoint}`);

  res
    .status(200)
    .json({ message: "QR code data received successfully", dynamicEndpoint });
});



// Middleware to check if the className is valid
const validClassNames = async (req, res, next) => {
  const { className } = req.params;

  // Function to fetch unique class names from class_history table
  const fetchValidClassNames = () => {
    return new Promise((resolve, reject) => {
      const query = "SELECT DISTINCT class_created FROM class_history";
      pool.query(query, (error, results) => {
        if (error) {
          return reject(error);
        }
        const classNames = results.map((row) => row.class_created);
        resolve(classNames);
      });
    });
  };

  try {
    // Fetch valid class names from the database
    const classNamesFromDB = await fetchValidClassNames();

    // Combine initial valid class names with those fetched from the database
    const allValidClassNames = ["BCA_M_2021_A_DVA", ...classNamesFromDB];

    // Check if className is in the validClassNames array
    if (!allValidClassNames.includes(className)) {
      return res.status(400).json({ error: "Invalid class name" });
    }

    next();
  } catch (error) {
    console.error("Error fetching valid class names:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// Define a route to fetch marked attendance students
// Define a route to fetch marked attendance students
app.get(
  "/api/marked-students/:className/:selectedDate",
  validClassNames,
  (req, res) => {
    const { className, selectedDate } = req.params;

    // Set to store marked attendance students
    const markedStudentsSet = new Set();

    // Function to fetch data from the database and send response
    const fetchDataAndUpdateResponse = () => {
      // SQL query to fetch marked attendance students
      const query = `SELECT name FROM \`${className}\` WHERE \`${selectedDate}\` = ? LIMIT 0, 25`;

      // Execute the query
      pool.getConnection((err, connection) => {
        if (err) {
          console.error("Error getting connection from pool:", err);
          return res
            .status(500)
            .json({ error: "Error getting connection from pool" });
        }

        connection.query(query, [1], (err, results) => {
          connection.release(); // Release the connection

          if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Error executing query" });
          }

          // Extract marked attendance students from the results
          const newMarkedStudents = results.map((row) => row.name);

          // Add new marked students to the set
          newMarkedStudents.forEach((student) =>
            markedStudentsSet.add(student)
          );

          // Convert set to array
          const markedStudents = [...markedStudentsSet];

          // Send the marked students as JSON response
          res.json({ markedStudents });
        });
      });
    };

    // Call fetchDataAndUpdateResponse initially
    fetchDataAndUpdateResponse();

    // Update the response every 1 second
    const interval = setInterval(fetchDataAndUpdateResponse, 1000);

    // Clear the interval when the request ends
    res.on("close", () => clearInterval(interval));
  }
);

// Define a route to fetch the total number of students for a class
app.get("/api/total-students/:className", validClassNames, (req, res) => {
  const { className } = req.params;

  // SQL query to count the total number of students in the class
  const countQuery = `SELECT COUNT(*) AS totalStudents FROM \`${className}\``;

  // Execute the query
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection from pool:", err);
      return res
        .status(500)
        .json({ error: "Error getting connection from pool" });
    }

    connection.query(countQuery, (err, results) => {
      connection.release(); // Release the connection

      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ error: "Error executing query" });
      }

      // Extract the total number of students from the results
      const totalStudents = results[0].totalStudents;

      // Send the total number of students as JSON response
      res.json({ totalStudents });
    });
  });
});







// Define a route to update attendance
app.post("/api/update-attendance", (req, res) => {
  const { studentName, selectedDate, className, attendanceStatus } = req.body;

  // Validate the received data
  if (!studentName || !selectedDate || !className || attendanceStatus === undefined) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  // Construct the SQL query to update attendance
  const updateAttendanceQuery = `
    UPDATE ${className}
    SET \`${selectedDate}\` = ?
    WHERE name = ?
  `;

  // Execute the SQL query
  pool.query(updateAttendanceQuery, [attendanceStatus, studentName], (error, results) => {
    if (error) {
      console.error("Error updating attendance:", error);
      return res.status(500).json({ error: "Error updating attendance" });
    }

    // Check if any rows were affected
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Student not found or attendance already marked" });
    }

    // Attendance updated successfully
    res.status(200).json({ message: "Attendance marked successfully" });
  });
});









// Define a new endpoint to handle the response from marking attendance
app.post("/selected-class", (req, res) => {
  const { className } = req.body;

  // Store the selectedClass
  selectedClass = className;

  console.log("Selected class:", selectedClass);
  res.status(200).json({ message: "Selected class stored successfully" });
});

let selectedDate = null; // Define selectedDate in the global scope

// Define a new endpoint to handle the response from marking attendance
app.post("/selected-date", (req, res) => {
  selectedDate = req.body.selectedDate; // Assign the selectedDate from request body to the global selectedDate variable
  console.log("Selected date:", selectedDate); // Access selectedDate here
  res.status(200).json({ message: "Selected date stored successfully" });
});

// Dynamic route to capture the dynamic endpoint
app.post(
  "/:className-:yearSection/:date/:randomString",
  validateDynamicEndpoint,
  (req, res) => {
    const { className, yearSection, date, randomString } = req.params;
    const data = req.body.email; // Accessing the 'email' field from the request body

    let extractedNumber = null;
    if (typeof data === "string") {
      // Using regular expression to find the first sequence of digits
      const extractedNumberMatch = data.match(/\d+/);
      if (extractedNumberMatch) {
        extractedNumber = extractedNumberMatch[0].replace(/^0+/, ""); // Trim leading zeros
      }
    }

    console.log(
      `Data received at ${className}-${yearSection}/${date}/${randomString}:`,
      extractedNumber
    );

    // Check if extractedNumber matches any enrollment_id in selectedClass table
    const checkQuery = `
      SELECT * FROM ${selectedClass}
      WHERE enrollment_id = ?
    `;
    pool.query(checkQuery, [extractedNumber], (error, results) => {
      if (error) {
        console.error("Error executing query:", error);
        return res.status(500).json({ error: "Error executing query" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Attendance not marked" });
      }

      // Check if column with selectedDate already exists
      const columnExistsQuery = `
        SELECT * FROM information_schema.columns
        WHERE table_name = ? AND column_name = ?
      `;
      pool.query(columnExistsQuery, [selectedClass, date], (error, results) => {
        if (error) {
          console.error("Error executing query:", error);
          return res.status(500).json({ error: "Error executing query" });
        }

        if (results.length === 0) {
          // Column with selectedDate does not exist, create it
          const createColumnQuery = `ALTER TABLE ${selectedClass} ADD \`${date}\` TINYINT(1) DEFAULT 0`;
          pool.query(createColumnQuery, (error) => {
            if (error) {
              console.error("Error creating column:", error);
              return res.status(500).json({ error: "Error creating column" });
            }
            // Mark 1 in the newly created column
            const markAttendanceQuery = `UPDATE ${selectedClass} SET \`${date}\` = 1 WHERE enrollment_id = ?`;
            pool.query(markAttendanceQuery, [extractedNumber], (error) => {
              if (error) {
                console.error("Error marking attendance:", error);
                return res
                  .status(500)
                  .json({ error: "Error marking attendance" });
              }
              res
                .status(200)
                .json({ message: "Attendance marked successfully" });
            });
          });
        } else {
          // Column with selectedDate already exists, mark 1 in it
          const markAttendanceQuery = `UPDATE ${selectedClass} SET \`${date}\` = 1 WHERE enrollment_id = ?`;
          pool.query(markAttendanceQuery, [extractedNumber], (error) => {
            if (error) {
              console.error("Error marking attendance:", error);
              return res
                .status(500)
                .json({ error: "Error marking attendance" });
            }
            res.status(200).json({ message: "Attendance marked successfully" });
          });
        }
      });
    });
  }
);



// Define a route to fetch the whole table data
app.get("/api/whole-table-data/:tableName", async (req, res) => {
  const { tableName } = req.params;

  try {
    // Query the database to fetch the whole table data
    const fetchTableData = () => {
      return new Promise((resolve, reject) => {
        const query = `SELECT * FROM ${tableName}`;
        pool.query(query, (error, results) => {
          if (error) {
            return reject(error);
          }
          resolve(results);
        });
      });
    };

    // Fetch the whole table data
    const tableData = await fetchTableData();

    // Send the table data as JSON response
    res.json(tableData);
  } catch (error) {
    console.error("Error fetching whole table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
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

  // SQL query to check if the table already exists
  const checkTableExistsQuery = `
    SELECT COUNT(*)
    AS count FROM information_schema.tables 
    WHERE table_schema = DATABASE() 
    AND table_name = ?
  `;

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

    // Check if the table already exists
    connection.query(checkTableExistsQuery, [tableName], (err, results) => {
      if (err) {
        connection.release();
        console.error("Error checking table existence:", err);
        return res.status(500).json({ error: "Error checking table existence" });
      }

      if (results[0].count > 0) {
        // Table already exists
        connection.release();
        return res.status(400).json({ error: "Class is already created by another user." });
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

// Start the server to listen on port 5000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Also available on http://192.168.0.109:${port}`);
});