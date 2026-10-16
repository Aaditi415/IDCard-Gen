# IDFoundry — ID Card Management System

**Create. Verify. Identify.**

IDFoundry is a web-based ID card management system that helps organizations manage master records, collect information through public forms, verify submissions, and prepare data for ID card generation.

The application connects master lists, configurable forms, templates, and student submissions to create an organized ID card management workflow.

## ✨ Features

- **Master List Management** — Import and manage organizational records, fields, and data.
- **Custom Form Configuration** — Configure forms to collect information required for ID cards.
- **Template Selection** — Associate forms with available ID card templates.
- **Public Form Submissions** — Allow users to submit their information through configured forms.
- **Data Verification** — Compare submitted information with master records.
- **Submission Management** — View and manage submissions with verification statuses.
- **ID Card Design** — Configure card layouts, styling, images, and front/back designs.
- **Demo and Preview** — Test the configured form and review the ID card design.
- **Organization-Based Data** — Keep records associated with the relevant organization.
- **Responsive Interface** — Designed to support different screen sizes.

## 🛠️ Technology Stack

### Frontend
- React
- JavaScript
- HTML5
- CSS3
- Vite
- Lucide React icons

### Backend
- Node.js
- Express.js
- REST APIs
- JWT-based authentication and role-based authorization

### Database
- MongoDB
- Mongoose

## 📁 Project Structure

The project is organized into frontend and backend components.

```text
IDFoundry/
├── client/                  # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                  # Express backend
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── package.json
│
└── README.md
```

*Note: Adjust the folder names above to match your actual project structure.*

## ⚙️ Getting Started

### Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB, locally or through MongoDB Atlas
- Git (optional)

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd IDFoundry
```

Replace `YOUR_REPOSITORY_URL` with your repository URL.

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Configure Frontend Environment

Create a `.env` file in the frontend directory if your application uses the Vite API URL configuration.

```env
VITE_API_URL=http://localhost:5000
```

Use the actual URL and port configured for your backend.

### 4. Install Backend Dependencies

Open another terminal:

```bash
cd server
npm install
```

### 5. Configure Backend Environment

Create a `.env` file in the backend directory and configure the environment variables required by your server.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
```

Make sure these variable names match the ones used in your backend code. Never commit real credentials or secrets to Git.

### 6. Start the Backend

From the backend directory, run:

```bash
npm run dev
```

If your `package.json` does not define a `dev` script, use the start command configured in your project.

### 7. Start the Frontend

From the frontend directory, run:

```bash
npm run dev
```

Open the local URL displayed by Vite in your terminal, commonly `http://localhost:5173`.

## 🔄 Application Workflow

1. **Create a Master List** — Define the fields and import organizational records.
2. **Configure the Form** — Choose the relevant master list and configure the form fields.
3. **Select a Template** — Associate the form with an ID card template.
4. **Design the ID Card** — Configure the card's appearance and layout.
5. **Test the Form** — Use the demo to check the configured fields and validation.
6. **Collect Submissions** — Let users submit their information through the public form.
7. **Verify the Data** — Compare submitted information with the master records.
8. **Manage Submissions** — Review verification results and submission statuses.
9. **Preview the ID Card** — Review the final card before generation or export, where supported.

## 🔐 Security

IDFoundry uses backend authentication and role-based authorization to protect organization-specific operations.

Security practices include:

- Validate incoming form data on the server.
- Restrict administrative operations to authorized users.
- Scope master lists and submissions to the correct organization.
- Keep database credentials and authentication secrets in environment variables.
- Avoid exposing private records through public endpoints.

## 🚧 Project Status

IDFoundry is under active development. Features, routes, database models, and workflows may change as development progresses.

## 🎯 Project Goal

The goal of IDFoundry is to simplify ID card management by connecting data collection, record verification, template configuration, and card design in one application.

## 👩‍💻 Author

Developed as a project focused on simplifying organizational ID card creation and data management.

---

**IDFoundry — Create. Verify. Identify.**
