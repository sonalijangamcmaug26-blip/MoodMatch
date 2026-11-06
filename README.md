# MoodMatch – Mood-Based Book and Movie Recommendation System

## 1. Project Overview

MoodMatch is a full-stack web application that recommends books and movies based on the user's current mood.

Users can:
- Register and log in.
- Select their current mood.
- Choose Books or Movies.
- View mood-based recommendations.
- Add content to favourites.
- View their mood history.
- Submit contact messages.

Administrators can:
- Manage books and movies.
- Add, update and delete catalogue records.
- Fetch book covers and movie posters automatically.
- Manage catalogue information.

## 2. Technologies Used

**Frontend**
- React.js
- JavaScript
- HTML
- CSS
- Vite
- Axios

**Backend**
- Node.js
- Express.js
- REST APIs
- Session-based authentication

**Database**
- MySQL
- MySQL Workbench

**External APIs**
- Open Library API – Book covers
- TMDB API – Movie posters

## 3. Prerequisites

Install the following software before running the project:

1. Node.js (version 18 or later).
2. MySQL Server.
3. MySQL Workbench.
4. Visual Studio Code.

## 4. Project Structure

```text
MoodMatch/
│
├── frontend/
│   └── React application
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── routes/
│   ├── scripts/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── moodmatch_db.sql
└── README.md
```

## 5. Installation and Setup

### Step 1: Extract the project

Extract the MoodMatch ZIP file to your preferred location.

Open the extracted MoodMatch folder in Visual Studio Code.

### Step 2: Install frontend dependencies

Open a terminal:

```bash
cd frontend
npm install
```

### Step 3: Install backend dependencies

Open another terminal:

```bash
cd backend
npm install
```

### Step 4: Create the MySQL database

1. Open MySQL Workbench.
2. Connect to your local MySQL Server.
3. Open the provided `moodmatch_db.sql` file.
4. Execute the SQL script.
5. Verify that the database and its tables have been created successfully.

If the SQL file does not create the database automatically, create `moodmatch_db` first and then import the script.

### Step 5: Configure environment variables

Create a `.env` file inside the backend folder.

Example configuration:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=moodmatch_db

SESSION_SECRET=YOUR_OWN_RANDOM_SECRET
TMDB_API_KEY=YOUR_TMDB_API_KEY
```

**Important:** Check `backend/config/env.js` and use the exact environment variable names expected by the project.

Never share your actual database password, session secret or API key.

### Step 6: Start the backend

Open a terminal:

```bash
cd backend
npm run dev
```

The backend should start successfully and connect to MySQL.

### Step 7: Start the frontend

Open a separate terminal:

```bash
cd frontend
npm run dev
```

Vite will display a local development URL.

Usually:

```text
http://localhost:5173
```

Open that URL in your browser.

## 6. Running the Application

Both servers must be running simultaneously:

| Application | Command |
|---|---|
| Backend | `npm run dev` |
| Frontend | `npm run dev` |

## 7. Admin Access

Use an existing administrator account if it is included in the database export.

If an administrator account needs to be created, use the backend admin creation script:

```bash
npm run admin:create
```

Follow the script's prompts.

## 8. Troubleshooting

**Database connection error**
- Check whether MySQL Server is running.
- Verify the database name, username and password in `.env`.
- Confirm that the database has been imported.

**Module not found**
- Run `npm install` in the relevant frontend or backend folder.

**Port already in use**
- Stop the other process using the port or configure an available port.

**Images are not loading**
- Check your internet connection.
- Verify the TMDB API key for movie poster fetching.
- Some book or movie records may not have available images.

**Login is not working**
- Verify that the database has been imported.
- Check the backend terminal for errors.
- Confirm that the session configuration is correct.

## 9. Important Notes

- Do not share the `.env` file.
- Do not upload `node_modules` in the project ZIP.
- Keep `package-lock.json` files.
- Each team member should configure their own local database credentials and API keys.
- The frontend and backend must both be running to use the application.

---

**Project:** MoodMatch  
**Description:** Mood-Based Book and Movie Recommendation System