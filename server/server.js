const path = require('path');
const http = require('http');
const publicPath = path.join(__dirname, './../public');
const express = require('express');
const socketIO = require('socket.io');
const port = process.env.PORT || 3000;

var app = express();
let server = http.createServer(app)
let io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('A New user just connected');
    socket.on('disconnect', () => {
        console.log('User has been disconnected');
    })
})


server.listen(port, () => {
    console.log(`Server is up on port : ${port}`);
})
