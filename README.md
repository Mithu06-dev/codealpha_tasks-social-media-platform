# 🌐 Social Media Platform

A lightweight, full-stack social media application built using standard web technologies and a robust Node.js backend. This platform allows users to create accounts, share posts, interact with content, and connect with others in real-time.

---

## 🚀 Features

* **User Authentication:** Secure registration and login using hashed passwords.
* **Dynamic Feed:** View, create, edit, and delete text-based or media-linked posts.
* **Interactions:** Like posts and leave comments in real-time.
* **User Profiles:** Customizable profiles displaying user bios and individual post history.
* **Responsive Design:** Fully optimized for mobile, tablet, and desktop screens.

---

## 🛠️ Tech Stack

### Frontend
* **HTML5:** Semantic structure.
* **CSS3:** Custom styling with modern Flexbox/Grid layouts and smooth transitions.
* **JavaScript (Vanilla):** Dynamic DOM manipulation and asynchronous API fetching (`Fetch API`).

### Backend
* **Node.js:** Runtime environment.
* **Express.js:** Server framework for handling RESTful API endpoints and static routing.

### Database
* **SQLite:** Serverless, lightweight relational database for storing user credentials, posts, likes, and comments.

---

## 📂 Project Structure

```text
├── config/
│   └── database.js          # SQLite connection and schema initialization
├── public/                  # Frontend static assets
│   ├── css/
│   │   └── style.css        # Main stylesheet
│   ├── js/
│   │   ├── main.js          # Core frontend logic (feed, likes, comments)
│   │   └── auth.js          # Login/Registration handling
│   ├── index.html           # Main feed / home page
│   ├── login.html           # Authentication page
│   └── profile.html         # User profile page
├── routes/
│   ├── auth.js              # Express routes for login/signup
│   └── posts.js             # Express routes for posts, comments, and likes
├── .gitignore
├── package.json
├── server.js                # Application entry point
└── database.sqlite          # SQLite database file (generated automatically)

⚙️ Getting StartedFollow these steps to set up and run the project locally.PrerequisitesMake sure you have Node.js installed on your machine.1. Clone the RepositoryBashgit clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)

cd your-repo-name

2. Install DependenciesInstall the required Node.js packages specified in the package.json:Bashnpm install
Dependencies installed include: express, sqlite3 (or sqlite), bcryptjs (for password hashing), and express-session (for user sessions)

.3. Initialize the DatabaseThe application is configured to automatically create the database.sqlite file and build the necessary tables (users, posts, comments, likes) upon the first server launch.

4. Run the ServerStart the development server:Bashnpm start
Alternatively, if you have nodemon installed for auto-restarts:Bashnpm run dev

5. Access the AppOpen your web browser and navigate to:Plaintexthttp://localhost:3000
🔒 API Endpoints OverviewMethodEndpointDescriptionAuth RequiredPOST/api/auth/signupRegisters a new userNoPOST/api/auth/loginAuthenticates a userNoGET/api/postsFetches all posts for the feedYesPOST/api/postsCreates a new postYesPOST/api/posts/:id/likeLikes/unlikes a specific postYesPOST/api/posts/:id/comment
