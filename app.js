// Import dependencies
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path'); // To work with file paths
const cors = require('cors');

// Setup Express and HTTP server
const app = express();
const server = http.createServer(app);
const dirPublic=path.join(__dirname, 'public');
const dirRoot=path.join(__dirname, '');

app.use(cors());
// Setup Socket.IO
const io = socketIo(server, {
 
    cors: {
        origin: "*", // Allow all origins (adjust for security in production)
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
        
    },
    // transports: ['websocket'], // Memaksa penggunaan WebSocket
});






// Serve the HTML file on the "/view" route
app.get('/view', (req, res) => {
    res.sendFile(dirRoot+'/socketio.html');
});

// Serve static files (CSS, JS) from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/cek', (req, res) => {
  const { nama, alamat } = req.query;

  // If both parameters are present, send them as JSON response
  if (nama && alamat) {
      res.json({
          status: "success",
          message: "Data received successfully",
          data: {
              nama: nama,
              alamat: alamat
          }
      });
  } else {
      // If parameters are missing, return error response
      res.json({
          status: "error",
          message: "Parameter tidak lengkap"
      });
  }
});

// Handle new socket connection
io.on('connection', (socket) => {
    console.log('New client connected');

    // Send a welcome message to the client
    socket.emit('message', 'Welcome to the socket server!');

    // Handle receiving a message from the client
    socket.on('chat message', (msg) => {
        console.log('Message received: ' + msg);
        // Broadcast the message to all clients
        io.emit('chat message', msg);
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start the server on port 3000 or the PORT specified in environment variables
server.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});
