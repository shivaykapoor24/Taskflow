# Taskflow — Local Setup Guide (Windows)

## Step-by-step (run each command separately in PowerShell)

### 1. Install root dependencies
```powershell
npm install
```

### 2. Install backend dependencies
```powershell
cd backend
npm install
cd ..
```

### 3. Install frontend dependencies
```powershell
cd frontend
npm install
cd ..
```

### 4. Configure backend environment
```powershell
cd backend
copy .env.example .env
```
Then open `backend\.env` in Notepad and fill in:
- `MONGO_URI` — from MongoDB Atlas (free at mongodb.com/atlas)
- `JWT_SECRET` — any long random string, e.g. `mysupersecretkey12345`

### 5. Run both servers (from root folder)
```powershell
npm run dev
```
This starts:
- Backend → http://localhost:5000
- Frontend → http://localhost:3000

---

## No MongoDB yet? Quick start with a local MongoDB

Install MongoDB Community: https://www.mongodb.com/try/download/community

Then use this in your `.env`:
```
MONGO_URI=mongodb://localhost:27017/taskflow
```

## Troubleshooting

**'nodemon' not found** — run `cd backend && npm install` first

**'react-scripts' not found** — run `cd frontend && npm install` first

**Port 5000 in use** — change `PORT=5001` in `backend\.env`

**CORS error in browser** — make sure `FRONTEND_URL=http://localhost:3000` in `backend\.env`
