// -------------------------- Setting up dependencies --------------------------
const express = require('express'); // Import the Express framework for building web applications
const cors = require('cors'); // Import CORS middleware to enable Cross-Origin Resource Sharing
// CORS allows your server to accept requests from different origins, which is useful for APIs.
const mongoose = require('mongoose'); // Import Mongoose for MongoDB object modeling
// Mongoose provides a schema-based solution to model your application data.
require('dotenv').config(); // Load environment variables from .env file
const { OAuth2Client } = require('google-auth-library'); // Import the Google OAuth2 client for user authentication
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Initialize the OAuth2 client with your Google Client ID
const session = require('express-session'); // Import express-session for session management
const { verify } = require('./googleAuth'); // Import the verify function from googleAuth.js to handle Google token verification

// -------------------------- Initial APP Configuration ------------------------
const port = process.env.PORT || 3000; // Use PORT from environment variables or default to 3000
const app = express(); // Create an Express application instance

// -------------------------- Middleware Configuration ------------------------
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

const corsOptions = {
  origin: 'https://todoapp-eight-ecru.vercel.app', // Allow only one origin to access the API
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Allow specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  credentials: true // Allow credentials to be included in requests
};
app.use(cors(corsOptions)); // Enable CORS with the defined options

// -------------------------- Database Configuration + APP STARTUP ------------------------
// This is where you would connect to your MongoDB database.
// The connection string is stored in an environment variable for security.
// The app listens on the specified port, and if the connection is successful, it logs a success message.
// If the connection fails, it logs an error message and exits the process.
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to the database successfully!");

    app.listen(port, () => {
    console.log(`✅ Server is running on http://localhost:${port}`);

});
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit the process if the database connection fails
  }
})();

// define the task schema
// This schema defines the structure of a task in the to-do app, including fields like title, description, due date, and completion status.
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  createdOn: { type: Date, required: true, default: Date.now },
  completed: { type: Boolean, required: true, default: false }
});

const gAuthenticateSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: false },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  displayName: { type: String, required: true },
  picture: { type: String, required: false }
});

const uAuthenticateSchema = new mongoose.Schema({
  googleId: { type: String, required: false },
  email: { type: String, required: true },
  password: { type: String, required: false },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  displayName: { type: String, required: true },
  picture: { type: String, required: false }
});

// create the task model
const Task = mongoose.model('Task', taskSchema);

// create the authentication model
const Authentication = mongoose.model('Authentication', authenticationSchema);

// -------------------------- API Routes -----------------------------
// GET, POST, PUT, PATCH, DELETE routes for tasks
// This is where you define the API endpoints for managing tasks in the to-do app
// This file handles the backend logic for the To-Do app, including task management routes.

// -------------------------- Task Routes -----------------------------

// -------------------------- Google OAuth2 Configuration ------------------------
// This section sets up Google OAuth2 for user authentication.
// It uses the google-auth-library to verify Google ID tokens.
app.get('/authentication/login', async (req, res) => {
  const { token } = req.body;

  try {
    const payload = await verify(token);

    // If verification is successful, you can create or update the user in your database
    res.json({ message: "Login successful!", user: payload });
  } catch (error) {
    console.error("Error verifying Google token:", error);
    res.status(401).json({ message: "Invalid token!" });
  }
});

app.post('/authentication/signup', async (req, res) => {
  const { token } = req.body;

  try {
    const payload = await verify(token);

    // If verification is successful, you can create or update the user in your database
    res.json({ message: "Account created successfully!", user: payload });
  } catch (error) {
    console.error("Error verifying Google token:", error);
    res.status(401).json({ message: "Invalid token!" });
  }
});


// Get all the tasks
// This route retrieves all tasks from the database, sorted by creation date in descending order.
app.get('/tasks', async (req, res) => {
  try {
    // Fetch all tasks from the database
    // The tasks are sorted by the createdOn field in descending order, so the most recent tasks appear first.
    // If the retrieval is successful, it returns the tasks as a JSON response.
    // If there is an error, it logs the error and returns a 500 status with an error message.
    const taskRetrieve = await Task.find().sort({ createdOn: -1 });

    // Check if any tasks were found
    // If no tasks are found, it returns a 404 status with a message indicating no tasks were found.
    // If tasks are found, it returns them as a JSON response.
    if (!taskRetrieve || taskRetrieve.length === 0) {
      return res.status(404).json({ message: "No tasks found!" });
    }

    res.json(taskRetrieve);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Error grabbing tasks!" });
  }
});

// Create a new task
// This route creates a new task by accepting task details from the request body.
// It validates the input, creates a new task instance, and saves it to the database.
app.post('/tasks/todo', async (req, res) => {
  try {
      const { title, description, dueDate } = req.body;
      const taskData = { title, description, dueDate};
      const taskCreate = new Task(taskData);

      // Validate the task data
      // If the task data is invalid, it returns a 400 status with an error message.
      // If the task is created successfully, it returns the new task and a success message.
      const newTask = await taskCreate.save(); // Save the new task to the database

      res.json(newTask);

      } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Error creating tasks!" });
      }
});

// Mark a task as completed
// This route marks a task as completed by updating its status in the database.
app.patch('/tasks/complete/:id', async (req, res) => {
  try {
    const { completed } = req.body;
    const taskId = req.params.id;

    // Find the task by ID and update its completed status
    // If the task is not found, it returns a 404 status with an error message.
    // If the update is successful, it returns the updated task and a success message.
    const taskCompleted = await Task.findByIdAndUpdate(taskId, { completed: completed }, { new: true });

    if (!taskCompleted) {
      return res.status(404).json({ message: "Task not found!" });
    }

    res.json({task: taskCompleted, message: "Task set as completed!"});

    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Error setting task as completed!" });
    }
});

// Mark a task as not completed
// This route marks a task as not completed by updating its status in the database.
app.patch('/tasks/notComplete/:id', async (req, res) => {
  try {
    const { completed } = req.body;
    const taskId = req.params.id;

    // Find the task by ID and update its completed status
    // If the task is not found, it returns a 404 status with an error message.
    // If the update is successful, it returns the updated task and a success message.
    const taskNotCompleted = await Task.findByIdAndUpdate(taskId, { completed: completed }, { new: true });

    if (!taskNotCompleted) {
      return res.status(404).json({ message: "Task not found!" });
    }

    res.json({task: taskNotCompleted, message: "Task set as not completed!"});
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Error setting task as not completed!" });
    }
});

// Delete a task
// This route deletes a task from the database.
app.delete(`/tasks/delete/:id`, async (req, res) => {
  try {
    const taskId = req.params.id;

    // Find the task by ID and delete it
    // If the task is not found, it returns a 404 status with an error message.
    // If the deletion is successful, it returns the deleted task and a success message.
    const taskDeleted = await Task.findByIdAndDelete(taskId);

    if (!taskDeleted) {
      return res.status(404).json({ message: "Task not found!" });
    }

    res.json({ task: taskDeleted, message: "Task deleted successfully!" });

  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Error deleting task!" });
  }
});

// Edit a task
// This route updates an existing task's details by its ID.
// It accepts the updated task details from the request body and updates the task in the database.
app.put('/tasks/update/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const { title, description, dueDate } = req.body;
    const taskData = { title, description, dueDate };

    // Find the task by ID and update it with the new data
    // If the task is not found, it returns a 404 status with an error message.
    // If the update is successful, it returns the updated task and a success message.
    const taskEdit = await Task.findByIdAndUpdate(taskId, taskData, { new: true });

    if (!taskEdit) {
      return res.status(404).json({ message: "Task not found!" });
    } 

    res.json({ task: taskEdit, message: "Task updated successfully!" });
    
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Error updating task!" });
  }
});