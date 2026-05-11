const express = require('express');
const http = require('http');
const cors = require('cors');
const { initSocket } = require('./config/socket');

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

app.get('/', (req, res) => {
    res.send("Notification Service Running...");
});

// Start Server
const PORT = 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
