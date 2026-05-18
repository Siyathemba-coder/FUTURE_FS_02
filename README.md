# MiniCRM — Client Lead Management System

A full-stack CRM application built to manage client leads generated from website contact forms. Built with React, Node.js/Express, and MySQL.

---

## Preview

- Secure admin login with JWT authentication
- Dashboard with live lead stats (total, new, contacted, converted)
- Add, edit, delete and search leads
- Change lead status inline
- Notes and follow-ups per lead
- Fully connected to a MySQL database

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Backend | Node.js, Express |
| Database | MySQL |
| Auth | JWT (JSON Web Tokens) + bcrypt |

---

## Project Structure

```
mini-crm-fullstack/
│
├── mini-crm/                   ← React frontend
│   ├── src/
│   │   ├── App.jsx             ← Main app component
│   │   └── main.jsx            ← React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── mini-crm-backend/           ← Node.js backend
│   ├── db/
│   │   ├── schema.sql          ← MySQL table definitions
│   │   └── seed.js             ← Creates first admin account
│   ├── src/
│   │   ├── server.js           ← Express app entry point
│   │   ├── db.js               ← MySQL connection pool
│   │   ├── middleware/
│   │   │   └── auth.js         ← JWT verification middleware
│   │   └── routes/
│   │       ├── auth.js         ← Login, /me, change-password
│   │       ├── leads.js        ← Lead CRUD + notes
│   │       └── notes.js        ← Note deletion
│   ├── .env.example            ← Environment variable template
│   ├── .gitignore
│   └── package.json
│
└── README.md
```

---

## Database Schema

Three tables are used:

**admins** — stores admin login accounts
```sql
id, email, password (hashed), name, created_at
```

**leads** — stores client leads
```sql
id, name, email, phone, source, status, created_at, updated_at
```

**notes** — stores follow-up notes per lead
```sql
id, lead_id (foreign key), content, created_at
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- [MySQL](https://dev.mysql.com/downloads/) v8 or higher
- [MySQL Workbench](https://www.mysql.com/products/workbench/) (optional, for managing the database visually)

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/mini-crm.git
cd mini-crm
```

---

### 2. Set up the database

Open MySQL Workbench (or any MySQL client) and run the contents of `mini-crm-backend/db/schema.sql`. This creates the `mini_crm` database and all three tables.

---

### 3. Configure the backend

```bash
cd mini-crm-backend
cp .env.example .env
```

Open `.env` and fill in your values:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=mini_crm

JWT_SECRET=any_long_random_string
JWT_EXPIRES_IN=8h

PORT=3001

ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=YourPassword123!
```

---

### 4. Install backend dependencies

```bash
npm install
```

---

### 5. Create the first admin account

```bash
node db/seed.js
```

You should see:
```
✓ Admin created: your@email.com
```

After this, remove `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env` file.

---

### 6. Start the backend

```bash
npm run dev
```

The API will run on `http://localhost:3001`. Test it by visiting `http://localhost:3001/api/health` — you should see `{"status":"ok"}`.

---

### 7. Install and start the frontend

Open a new terminal tab:

```bash
cd mini-crm
npm install
npm run dev
```

The app will open at `http://localhost:5173`.

---

### 8. Log in

Use the email and password you set in your `.env` file to sign in.

---

## API Endpoints

All endpoints except `/api/auth/login` require the header:
```
Authorization: Bearer <token>
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Sign in, returns JWT token |
| GET | `/api/auth/me` | Returns current admin info |
| POST | `/api/auth/change-password` | Change admin password |
| GET | `/api/leads` | Get all leads |
| GET | `/api/leads/:id` | Get a single lead |
| POST | `/api/leads` | Create a new lead |
| PUT | `/api/leads/:id` | Update a lead |
| DELETE | `/api/leads/:id` | Delete a lead |
| GET | `/api/leads/:id/notes` | Get notes for a lead |
| POST | `/api/leads/:id/notes` | Add a note to a lead |
| DELETE | `/api/notes/:id` | Delete a note |
| GET | `/api/health` | Health check |

---

## Security

- Passwords are hashed using **bcrypt** (12 rounds)
- Authentication uses **JWT** tokens with 8h expiry
- Rate limiting applied — 20 requests/15min on auth, 120 requests/min on general API
- CORS restricted to the frontend origin
- `.env` file is excluded from version control via `.gitignore`

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `ER_ACCESS_DENIED_ERROR` | Wrong `DB_USER` or `DB_PASSWORD` in `.env` |
| `ECONNREFUSED` | MySQL isn't running |
| `ER_BAD_DB_ERROR` | Run `schema.sql` in MySQL Workbench first |
| `ER_NOT_SUPPORTED_AUTH` | Run: `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'yourpassword'; FLUSH PRIVILEGES;` |
| `EADDRINUSE: 3001` | Port already in use — run `npx kill-port 3001` then `npm run dev` |
| `Failed to fetch` on login | Backend isn't running — start it with `npm run dev` |

---

## Skills Gained

- CRUD operations with a relational database
- REST API design with Express
- JWT-based authentication and route protection
- React state management and component design
- Full-stack integration (frontend ↔ backend ↔ database)
- Business workflows (lead tracking, status management, notes)

---

## Author

Built by **Siyathemba Msimang** as part of the Future Interns programme.
