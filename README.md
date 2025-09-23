# To-Do App (Flask)

A simple **Flask** web application with user registration, login, and logout functionality.  
User data is stored in an SQLite database, and the frontend uses Bootstrap for styling.  

---

## Features
- User registration (stored in SQLite)
- User login (Email + Password)
- User logout (Session management)
- Flash messages for success/error feedback
- `.gitignore` to exclude `venv/`, database files, and cache files

---


##  Getting Started

### 1. Create & activate virtual environment

`python -m venv venv`
# On Windows (PowerShell)
`.\venv\Scripts\Activate.ps1`
# On macOS/Linux
`source venv/bin/activate`

### 2. Install dependencies

`pip install -r requirements.txt`

### 3. Run Application

`python app.py`

App will be available at: http://127.0.0.1:5000/

