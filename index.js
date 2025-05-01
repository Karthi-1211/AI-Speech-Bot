'use strict';

const express = require('express');
const socketIo = require('socket.io');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const port = process.env.PORT || 5005;

// Google Gemini API Configuration
const genAI = new GoogleGenerativeAI('AIzaSyD1YtJSgesaurQDfadrgpDyFCOUK0LCBkg'); // Replace with your Gemini API key

// Middleware to serve static files
app.use(express.static(__dirname + '/views')); // html
app.use(express.static(__dirname + '/public')); // js, css, images

// Start the server
const server = app.listen(port, () => {
  const host = server.address().address === '::' ? 'localhost' : server.address().address;
  const url = `http://${host}:${server.address().port}`;
  console.log(`Express server listening on port ${server.address().port}`);
  console.log(`Open the project at: ${url}`);
});

// Setup Socket.io
const io = socketIo(server);

// Track requests per socket
const requestMap = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  const sessionId = uuidv4();

  socket.on('chat message', async (text) => {
    console.log(`[${socket.id}] Message received:`, text);

    // Cancel any existing request
    if (requestMap.has(socket.id)) {
      const { controller } = requestMap.get(socket.id);
      controller.abort();
      console.log(`[${socket.id}] Previous request aborted`);
    }

    // Create a new AbortController
    const abortController = new AbortController();
    requestMap.set(socket.id, { controller: abortController, text, timestamp: Date.now(), active: true });

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      console.log(`[${socket.id}] Starting AI request`);
      const currentRequest = model.generateContent(text, { signal: abortController.signal });

      // Simulate a delay for testing (remove this in production if not needed)
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3-second delay

      const result = await currentRequest;
      const response = await result.response;
      const aiText = response.text();

      console.log(`[${socket.id}] Bot reply:`, aiText);
      socket.emit('bot reply', aiText);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`[${socket.id}] Request aborted by user`);
        socket.emit('bot stopped', 'Request aborted.');
      } else {
        console.error(`[${socket.id}] Gemini API Error:`, error);
        socket.emit('bot reply', 'Sorry, I had an issue processing that.');
      }
    } finally {
      if (requestMap.has(socket.id) && requestMap.get(socket.id).active) {
        console.log(`[${socket.id}] Request completed, keeping entry until stopped`);
      } else {
        requestMap.delete(socket.id);
        console.log(`[${socket.id}] Request entry removed`);
      }
    }
  });

  socket.on('stop bot', () => {
    if (requestMap.has(socket.id)) {
      const { controller, text, timestamp } = requestMap.get(socket.id);
      controller.abort();
      requestMap.set(socket.id, { ...requestMap.get(socket.id), active: false }); // Mark as inactive but keep for logging
      console.log(`[${socket.id}] Bot stopped by user (original message: "${text}", started at: ${new Date(timestamp)})`);
      socket.emit('bot stopped', 'Bot stopped.');
    } else {
      console.log(`[${socket.id}] No active request to stop`);
      socket.emit('bot stopped', 'Nothing to stop.');
    }
  });

  socket.on('disconnect', () => {
    if (requestMap.has(socket.id)) {
      requestMap.get(socket.id).controller.abort();
      console.log(`[${socket.id}] Aborted request on disconnect`);
      requestMap.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Web UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
