const http = require('http');
const WebSocket = require('ws');
const setupWSConnection = require('y-websocket/bin/utils').setupWSConnection;

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 1234;

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (conn, req) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const roomName = url.pathname.slice(1) || 'default';
  setupWSConnection(conn, req, { docName: roomName });
});

server.listen(port, host, () => {
  console.log(`✅ y-websocket server running at ws://${host}:${port}`);
});
