// -------------------------- Setting up dependencies --------------------------
const express = require('express'); // Import the Express framework for building web applications
const cors = require('cors'); // Import CORS middleware to enable Cross-Origin Resource Sharing
// CORS allows your server to accept requests from different origins, which is useful for APIs.
const mongoose = require('mongoose'); // Import Mongoose for MongoDB object modeling
// Mongoose provides a schema-based solution to model your application data.
require('dotenv').config(); // Load environment variables from .env file

// -------------------------- Initial APP Configuration ------------------------
const port = process.env.PORT || 3000; // Use PORT from environment variables or default to 3000
const app = express(); // Create an Express application instance

// -------------------------- Middleware Configuration ------------------------
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(cors('*')); // Enable CORS for all origins

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

// create the task model
const Task = mongoose.model('Task', taskSchema);

// -------------------------- API Routes -----------------------------
// GET, POST, PUT, PATCH, DELETE routes for tasks
// This is where you define the API endpoints for managing tasks in the to-do app
// This file handles the backend logic for the To-Do app, including task management routes.

// -------------------------- Task Routes -----------------------------
// Get all the tasks
// This route retrieves all tasks from the database, sorted by creation date in descending order.
app.get('/tasks', async (req, res) => {
  try {
    const taskRetrieve = await Task.find().sort({ createdOn: -1 }); // Fetch tasks from the database, sorted by creation date
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