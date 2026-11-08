# Expense Management API

A REST API for managing personal expenses with Express, MongoDB, and Mongoose.

## Setup

1. Install Node.js LTS and MongoDB, or create a MongoDB Atlas database.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env` and set `MONGODB_URI`, `FRONTEND_ORIGIN`, and two long random JWT secrets.
4. Start development mode with `npm run dev`.

The API runs on `http://localhost:5000` by default.

## Frontend

The React dashboard lives in the `client` folder. Use two terminals:

```powershell
# Terminal 1: from the project root
Set-Location "D:\FSD PROJECT"
npm run dev

# Terminal 2: start the dashboard
Set-Location "D:\FSD PROJECT\client"
npm install
npm run dev
```

Open the Vite URL shown in Terminal 2, usually `http://localhost:5173/`.
The backend must be connected to MongoDB before expenses can be saved or loaded.

### Public repository and deployment safety

- Never commit `.env`, `atlas-credentials.env`, or any other file containing credentials.
- Use a separate MongoDB database and randomly generated JWT secrets for each deployment.
- Set `NODE_ENV=production`, `ADMIN_LOGIN_ID`, and `ADMIN_PASSWORD` in the deployment secret manager.
- Restrict `FRONTEND_ORIGIN` to the deployed dashboard URL rather than allowing all origins.
- If a database password or JWT secret has ever been exposed, rotate it before publishing or deploying.

### Local admin login

In development, the backend creates or refreshes this admin account after connecting to MongoDB:

- Login ID: `admin@spendwise.local`
- Password: `Admin@12345`

Set `ADMIN_LOGIN_ID` and `ADMIN_PASSWORD` in `.env` to use different local credentials. Do not use the development defaults in production. The login page includes a **Use demo admin credentials** button when running through Vite's development server.

## Main endpoints

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/expenses` (Bearer access token required)
- `GET /api/expenses` (Bearer access token required)
- `GET /api/expenses/summary?month=9&year=2026` (Bearer access token required)
- `GET`, `PUT`, `PATCH`, and `DELETE /api/expenses/:id` (Bearer access token required)

Refresh tokens are rotated and stored only in an HTTP-only cookie. Expense records are scoped to their authenticated owner. Amounts are converted from the API's decimal currency input into integer paise/cents before persistence.

## Example request

```json
{
  "title": "Weekly groceries",
  "amount": 45.5,
  "category": "Food",
  "date": "2026-09-29",
  "notes": "Fruit, vegetables, and rice"
}
```
