# Real-Time Bids — Fullstack Auction Project

Ye repository ek real-time auction application hai jisme Frontend (React + Vite) aur Backend (Node + Express + MongoDB + Socket.io) dono included hain.

## Quick overview
- Backend: `Backend/` — Express API, MongoDB (Mongoose), sockets for real-time bids.
- Frontend: `Frontend/` — React app (Vite), connects to backend via API and socket.io-client.

## Prerequisites
- Node.js (v18+ recommended)
- npm (comes with Node) or yarn
- MongoDB access (local or Atlas)

## Environment variables
Backend expects a `.env` file inside `Backend/` with (at least) these variables:

```
PORT=5000
MONGO_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret
# Cloudinary (if used)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Frontend uses Vite env variables. Create a `.env` (or `.env.local`) at `Frontend/` root with:

```
VITE_API_URL=http://localhost:5000
```

Replace the URL with your backend URL in production.

## Backend — setup & run
1. Change to the backend folder:

```powershell
cd Backend
```

2. Install dependencies:

```powershell
npm install
```

3. Start in development (auto-restarts with `nodemon`):

```powershell
npm run dev
```

4. Start production:

```powershell
npm start
```

The backend listens on `PORT` (default 5000). API base path used by frontend: `http://localhost:5000/api` (see `Frontend/src/services/axiosConfig.js`).

## Frontend — setup & run
1. Change to the frontend folder:

```powershell
cd Frontend
```

2. Install dependencies:

```powershell
npm install
```

3. Start development server (Vite):

```powershell
npm run dev
```

4. Build for production:

```powershell
npm run build
```

5. Preview production build locally:

```powershell
npm run preview
```

## Git notes
- `Backend/.gitignore` has been added to ignore `node_modules` and `.env` for the backend.
- If `node_modules` or `.env` were already committed, remove them from tracking (keeps local files) with:

```powershell
# From repo root
git rm -r --cached Backend/node_modules
git rm --cached Backend/.env
git commit -m "Remove node_modules and .env from repo"
git push
```

To fully remove a file from history you will need a history-rewriting tool such as BFG or git filter-branch — ask if you want help with that.

## Useful notes
- Frontend expects `VITE_API_URL` to point to the backend (e.g., `http://localhost:5000`).
- Backend uses `dotenv` so make sure `.env` is present when running locally.
- Socket URL: frontend connects using the same `VITE_API_URL` base; ensure CORS/socket origins allow your frontend origin.

## Contributing
- Create branches per feature: `git checkout -b feat/your-feature`
- Run both backend and frontend locally for end-to-end testing.

## License
MIT (adjust as needed)

---

