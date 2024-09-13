const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Setup Express
const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = socketIo(server, {
    cors: {
        origin: "*", // Mengizinkan semua origin (atur untuk keamanan di produksi)
        methods: ["GET", "POST"]
    }
});

// Middleware CORS
// app.use(cors()); // Mengizinkan semua origin

// Atau setup CORS lebih spesifik seperti ini
/*
app.use(cors({
    origin: 'http://your-frontend-domain.com', // Ganti dengan domain klien yang diperbolehkan
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true // Untuk mengizinkan cookies cross-origin
}));
*/


app.use(cors({
  origin: 'https://wa-xi-two.vercel.app', // Pastikan untuk mengizinkan domain yang tepat
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date', 'X-Api-Version']
}));


const dirPublic=path.join(__dirname, 'public');

const dirRoot=path.join(__dirname, '');



// Serve the HTML file on the "/view" route

app.get('/view', (req, res) => {

    res.sendFile(dirRoot+'/socketio.html');

});

// // Serve static files or views
// app.get('/view', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// Example of GET route handling CORS
app.get('/cek', (req, res) => {
    const { nama, alamat } = req.query;

    if (nama && alamat) {
        res.json({
            status: "success",
            message: "Data received successfully",
            data: { nama, alamat }
        });
    } else {
        res.json({
            status: "error",
            message: "Parameter tidak lengkap"
        });
    }
});

// Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.emit('message', 'Welcome to the WebSocket server!');
    
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start the server
server.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});
