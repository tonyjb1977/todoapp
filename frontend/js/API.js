// ---------------------------------------------- Global variables ----------------------------------------------
const taskForm = document.getElementById('taskForm'); // The form for creating new tasks
const editTaskForm = document.getElementById('editTaskForm'); // The form for editing existing tasks
// const url = 'http://localhost:3000'; // The base URL for the API
const url = 'https://todoapp-e4g9.onrender.com'; // The base URL for the API in production

// ---------------------------------------------- General Functions ----------------------------------------------
// This function resets the task form after a task is created or edited.
// It clears all input fields to prepare for the next task entry.
function resetForm() {
    taskForm.reset();
}

// ---------------------------------------------- General event listeners ----------------------------------------------
// This event listener waits for the DOM to be fully loaded before displaying tasks.
// It ensures that the task lists are populated as soon as the page is ready.
window.addEventListener("DOMContentLoaded", () => {
    displayTasks();
});

// ---------------------------------------------- Event Listeners ----------------------------------------------
// To be used for all the event listeners for each task action.
const toDoList = document.getElementById("toDoList"); // The list for tasks that are not completed
const completedList = document.getElementById("completedList"); // The list for completed tasks

// Event listener for the task form submission
taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    createNewTask();
});

// Completed tasks event listener
toDoList.addEventListener("click", (event) => {
    if (event.target.classList.contains("done")) {
        const taskId = event.target.getAttribute("data-id");
        completedTask(taskId);
    }
});

// To Not complete a task event listener
completedList.addEventListener("click", (event) => {
    if (event.target.classList.contains("notDone")) {
        const taskId = event.target.getAttribute("data-id");
        notCompletedTask(taskId);
    }
});

// To delete a task event listener
[toDoList, completedList].forEach(list => {
    list.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete")) {
            const taskId = event.target.getAttribute("data-id");
            deleteTask(taskId);
        }
    });
});

// To edit a task event listener
toDoList.addEventListener("click", (event) => {
    if (event.target.classList.contains("edit")) {
        const taskId = event.target.getAttribute("data-id");
        const taskTitle = event.target.getAttribute("data-title");
        const taskDescription = event.target.getAttribute("data-description");
        const taskDueDate = event.target.getAttribute("data-due-date");

        const editTaskName = document.getElementById('editTaskName');
        const editTaskDescription = document.getElementById('editTaskDescription');
        const editDueDate = document.getElementById('editDueDate');
        const saveChangesButton = document.getElementById('saveChangesButton');
        const formattedDueDate = new Date(taskDueDate).toISOString().split('T')[0];
        
        editTaskName.value = taskTitle;
        editTaskDescription.value = taskDescription;
        editDueDate.value = formattedDueDate;       

        saveChangesButton.addEventListener("click", async () => {
            await editTask(taskId);

            const editTaskModal = new bootstrap.Modal(document.getElementById('editTaskModal'));
            editTaskModal.hide();
        }, { once: true });
    }
});

// ---------------------------------------------- Task Functions ----------------------------------------------

// -------------------------- Get Tasks --------------------------
// This function fetches all tasks from the server and displays them in the respective lists.
// It formats each task based on its completion status and appends it to the appropriate list.
async function displayTasks() {
    try {
        const response = await fetch(`${url}/tasks`);
        const data = await response.json();
        
        function formatTask(task) {
            const li = document.createElement('li');
            li.className = 'p-3 shadow-sm mt-2 card';
            li.innerHTML = task.completed ?
            // Completed tasks
            `
            <div class="d-flex justify-content-between align-items-center">
                <h4 class="col-11 text-decoration-line-through opacity-50">${task.title}</h4>
                <button data-id="${task._id}" type="button" class="btn-close delete" aria-label="Close"></button>
            </div>
            <p class="text-decoration-line-through opacity-50">${task.description}</p>
            <p class="text-decoration-line-through opacity-50"><strong>Due Date:</strong><span class="text-muted">${new Date(task.dueDate).toLocaleDateString()}</span></p>
            <div class="d-flex justify-content-between align-items-end">
                <div>
                    <button data-id="${task._id}" type="button" class="btn btn-dark shadow-sm notDone">Not done</button>
                </div>
                <p class="m-0 text-decoration-line-through opacity-50"><strong>Created on: </strong><span class="text-muted">${new Date(task.createdOn).toLocaleDateString()}</span></p>
            </div>
            `
            :
            // Not completed tasks
            `
            <div class="d-flex justify-content-between align-items-center">
                <h4 class="col-11">${task.title}</h4>
                <button data-id="${task._id}" type="button" class="btn-close delete" aria-label="Close"></button>
            </div>
            <p>${task.description}</p>
            <p><strong>Due Date:</strong><span class="text-muted">${new Date(task.dueDate).toLocaleDateString()}</span></p>
            <div class="d-flex justify-content-between align-items-end">
                <div>
                    <button data-id="${task._id}" data-title="${task.title}" data-description="${task.description}" data-due-date="${task.dueDate}" data-bs-toggle="modal" data-bs-target="#editTaskModal" type="button" class="btn btn-dark shadow-sm edit">Edit</button>
                    <button data-id="${task._id}" type="button" class="btn btn-dark shadow-sm done">Done</button>
                </div>
                <p class="m-0"><strong>Created on: </strong><span class="text-muted">${new Date(task.createdOn).toLocaleDateString()}</span></p>
            </div>
            `;
            return li;
        }

        toDoList.innerHTML = '';
        completedList.innerHTML = '';

        const tasks = data;

        tasks.forEach(task => {
            task.completed ? completedList.appendChild(formatTask(task)) : toDoList.appendChild(formatTask(task));
        })
        resetForm();
    } catch (error) {
        console.error("Error displaying tasks:", error);
    }   
}

// -------------------------- New Task --------------------------
// This function creates a new task by gathering input from the form, validating it, and sending it to the server.
// If the task is successfully created, it refreshes the task display.
async function createNewTask() {
    try {
            const taskDetails = {
            title: document.getElementById('taskName').value.trim(),
            description: document.getElementById('taskDescription').value.trim(),
            dueDate: document.getElementById('dueDate').value.trim(),
        }

        if (!taskDetails.title || !taskDetails.description || !taskDetails.dueDate) {
            return alert("Please fill in all fields.");
        }
        
        const response = await fetch(`${url}/tasks/todo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskDetails)
        });

        if (!response.ok) {
            throw new Error(`Failed to create task! Status: ${response.status}`);
        }   

        const data = await response.json();

        console.log("New task created:", data);

        displayTasks();
    } catch (error) {
        console.error("Error creating new task:", error);
    }
}

// --------------------------- Complete task ----------------------
// This function marks a task as completed by sending a PATCH request to the server.
// It updates the task's status and refreshes the task display to reflect the change.
async function completedTask(taskId) {
    try {
        const response = await fetch(`${url}/tasks/complete/${taskId}`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ completed: true })
        });

        if (!response.ok) {
            throw new Error(`Failed to complete task! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Task completed:", data);
        displayTasks();

    } catch (error) {
        console.error("Error completing task:", error);

    }
}

// --------------------------- Not complete task ------------------
// This function marks a task as not completed by sending a PATCH request to the server.
// It updates the task's status and refreshes the task display to reflect the change.
async function notCompletedTask(taskId) {
       try {
        const response = await fetch(`${url}/tasks/notComplete/${taskId}`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ completed: false })
        });

        if (!response.ok) {
            throw new Error(`Failed to not complete task! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Task not completed:", data);
        displayTasks();

    } catch (error) {
        console.error("Error not completing task:", error);

    }
}

// -------------------------- Deleting Task --------------------------
// This function would be used to delete a task. It would find the task by its ID and remove it from the task array.
// It then refreshes the task display to reflect the change.
async function deleteTask(taskId) {
try {
        const response = await fetch(`${url}/tasks/delete/${taskId}`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to delete task! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Task deleted:", data);
        displayTasks();

    } catch (error) {
    console.error("Error deleting task:", error);
    } 
}

// -------------------------- Edit Task --------------------------
// This function would be used to edit a task. It would find the task by its ID
// and update its details based on the input from the edit form.
// It then refreshes the task display to reflect the changes.
async function editTask(taskId) {

    const updatedTile = editTaskName.value.trim();
    const updatedDescription = editTaskDescription.value.trim();
    const updatedDueDate = editDueDate.value.trim();

    const updatedDetails = {
        title: updatedTile,
        description: updatedDescription,
        dueDate: updatedDueDate
    }

    try {
        response = await fetch(`${url}/tasks/update/${taskId}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedDetails)
        });
        
        if (!response.ok) {
            throw new Error(`Failed to edit task! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Task edited:", data);
        displayTasks();

    }catch (error) {
        console.error("Error editing task:", error);
    }
}