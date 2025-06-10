const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(express.static('public'));

// Initial marker position
let currentMarkerPosition = {
  lat: -7.4704,
  lng: 110.2177
};

// Movement history
let movementHistory = [currentMarkerPosition];

io.on('connection', (socket) => {
  console.log('User connected');
  console.log('User count after connect:', io.engine.clientsCount);

  // Emit current user count
  io.emit('userCount', io.engine.clientsCount);

  // Emit marker init to newly connected client
  socket.emit('markerInit', {
    position: currentMarkerPosition,
    history: movementHistory
  });

  // Receive marker move
  socket.on('markerMove', (data) => {
    currentMarkerPosition = data;
    movementHistory.push(data);
    io.emit('markerMove', data);
  });

  // On disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected');
    console.log('User count after disconnect:', io.engine.clientsCount);
    io.emit('userCount', io.engine.clientsCount);
  });
});

// Run server
server.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
