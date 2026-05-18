# MiniCRM — Backend

Node.js + Express REST API backed by MySQL.

## Project layout

```
mini-crm-backend/
├── db/
│   ├── schema.sql      ← Run once to create tables
│   └── seed.js         ← Run once to create the first admin account
├── src/
│   ├── server.js       ← Entry point
│   ├── db.js           ← MySQL connection pool
│   ├── middleware/
│   │   └── auth.js     ← JWT verification
│   └── routes/
│       ├── auth.js     ← POST /api/auth/login, GET /api/auth/me
│       ├── leads.js    ← CRUD + notes sub-routes
│       └── notes.js    ← DELETE /api/notes/:id
├── .env.example
└── package.json
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env — fill in your MySQL credentials and a strong JWT_SECRET
```

### 3. Create the database tables
```bash
mysql -u root -p < db/schema.sql
```

### 4. Create the first admin account
```bash
node db/seed.js
# Then remove ADMIN_EMAIL and ADMIN_PASSWORD from your .env
```

### 5. Start the server
```bash
# Development (auto-restarts on save)
npm run dev

# Production
npm start
```

The API runs on **http://localhost:3001**.

---

## API reference

All `/api/leads` and `/api/notes` routes require:
```
Authorization: Bearer <token>
```

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | `{email, password}` | Returns JWT token |
| GET | `/api/auth/me` | — | Returns current admin |
| POST | `/api/auth/change-password` | `{currentPassword, newPassword}` | Change password |
| GET | `/api/leads` | — | All leads |
| GET | `/api/leads/:id` | — | Single lead |
| POST | `/api/leads` | `{name, email, phone?, source?, status?}` | Create lead |
| PUT | `/api/leads/:id` | any lead fields | Update lead |
| DELETE | `/api/leads/:id` | — | Delete lead (cascades notes) |
| GET | `/api/leads/:id/notes` | — | Notes for a lead |
| POST | `/api/leads/:id/notes` | `{content}` | Add note |
| DELETE | `/api/notes/:id` | — | Delete note |
| GET | `/api/health` | — | Health check |

## Security features
- Passwords hashed with bcrypt (12 rounds)
- JWT signed with HS256, 8h expiry by default
- Rate limiting: 20 req/15min on auth, 120 req/min on general API
- CORS restricted to the frontend origin
