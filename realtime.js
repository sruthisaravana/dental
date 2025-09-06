// realtime-proxy.js
// Simple WebSocket proxy: browser <--ws--> this server <--ws--> OpenAI Realtime
// For local dev only. Keep OPENAI_API_KEY in env.

import http from 'node:http';
import WebSocket from 'ws';
import fetch from 'node-fetch'; // optional if you want to prefetch something

const PORT = process.env.PORT ? Number(process.env.PORT) : 2095;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.error('Please set OPENAI_API_KEY in env.');
  process.exit(1);
}

// URL to OpenAI Realtime - change params per latest docs (model/intent).
const OPENAI_WS_URL = 'wss://api.openai.com/v1/realtime?intent=transcription';

const server = http.createServer((req, res) => {
  // simple diagnostic endpoint
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('realtime-proxy running\n');
  }
  // For non-upgrade requests to /api/realtime-ws, return 400
  res.writeHead(400);
  res.end('This endpoint only supports WebSocket upgrade.\n');
});

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (clientWs, req) => {
  console.log('Browser connected:', req.socket.remoteAddress);

  // Create a connection to OpenAI realtime
  const openaiWs = new WebSocket(OPENAI_WS_URL, {
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      // Add any headers required by OpenAI docs; e.g. 'OpenAI-Beta': 'realtime=v1' if required
    },
  });

  openaiWs.on('open', () => {
    console.log('Connected to OpenAI realtime.');
  });

  openaiWs.on('message', (data) => {
    // Forward OpenAI messages to the browser client
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(data);
    }
  });

  openaiWs.on('close', (code, reason) => {
    console.log('OpenAI WS closed', code, reason?.toString?.() || reason);
    try { clientWs.close(); } catch(_){}
  });

  openaiWs.on('error', (err) => {
    console.error('OpenAI WS error', err);
    try { clientWs.send(JSON.stringify({ type: 'error', message: 'OpenAI socket error' })); } catch(_){}
  });

  clientWs.on('message', (msg) => {
    // Here msg can be a Buffer (audio chunk) or string (JSON control)
    if (openaiWs.readyState !== WebSocket.OPEN) {
      // Optionally buffer until open
      console.warn('OpenAI WS not open yet, dropping or buffering message.');
      return;
    }

    // If client sent binary (Buffer) — forward as binary
    if (Buffer.isBuffer(msg) || msg instanceof ArrayBuffer) {
      // If OpenAI expects base64 in JSON, encode; else forward raw binary.
      // Many realtime implementations accept either raw opus frames or base64 JSON messages.
      // We'll *forward binary raw* to OpenAI; if OpenAI expects base64, adjust here.
      openaiWs.send(msg);
      return;
    }

    // String messages - forward as-is (control messages)
    try {
      openaiWs.send(msg);
    } catch (e) {
      console.error('Failed to send control msg to OpenAI', e);
    }
  });

  clientWs.on('close', () => {
    console.log('Browser WS closed');
    try { openaiWs.close(); } catch(_){}
  });

  clientWs.on('error', (err) => {
    console.error('Client WS error', err);
    try { openaiWs.close(); } catch(_){}
  });
});

server.on('upgrade', (request, socket, head) => {
  // Only allow the /api/realtime-ws path to upgrade
  const { url } = request;
  if (!url || !url.startsWith('/api/realtime-ws')) {
    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

server.listen(PORT, () => {
  console.log(`Realtime WebSocket proxy listening on ws://localhost:${PORT}/api/realtime-ws`);
});
