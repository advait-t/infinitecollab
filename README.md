# InfiniteCollab (Local-First, Prod-Feature Build)

This package contains a fully functional **collaborative infinite whiteboard**:
- Apple Pencil pressure support (Safari/iPad compatible)
- Real-time sync via **Yjs + y-websocket**
- **Live cursors** with usernames and colors
- Tools: **pen / highlighter / eraser / text / hand (pan)**
- **Layers** (add, rename, reorder, toggle visibility)
- Color + width + opacity controls
- **Export PNG**
- **Dark ↔ Light mode**: automatic (follows system), with **manual override** button; persisted in localStorage
- Production-ready frontend; local backend

## Quick Start (Local)

### 1) Run the WebSocket server
```bash
cd server
npm install
npm start
```
You should see:
```
✅ y-websocket server running at ws://0.0.0.0:1234
```

### 2) Run the frontend
```bash
cd ../client
npm install
npm run dev
```
Open http://localhost:5173 → Click **Start a board** → share the `/board/<id>` URL.

The frontend is pre-configured to connect to `ws://localhost:1234` via `.env`.

---

## Later: Deploy to Netlify + Render

- **Server**: Deploy `server/` to Render/Railway. Start command: `node index.js`.
- **Client**: Deploy `client/` to Netlify/Vercel. Set `VITE_WS_URL` to your Render WebSocket URL
  (e.g., `wss://your-app.onrender.com`).

This local build includes **all** production features for parity with your eventual deployment.

