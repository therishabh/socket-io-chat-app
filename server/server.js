const path = require('path');
const http = require('http');
const publicPath = path.join(__dirname, './../public');
const express = require('express');
const socketIO = require('socket.io');
const port = process.env.PORT || 3000;
const { generateMessage, generateLocationMessage } = require('./utils/message');

var app = express();
let server = http.createServer(app)
let io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('A New user just connected');

    socket.emit('newMessage', generateMessage('Admin', 'Welcome to archchat Chat box'));

    socket.broadcast.emit('newMessage', generateMessage('Admin', 'New User Joined'))

    // listen event
    socket.on('createMessage', (message) => {
        console.log('Create Message', message);

        // == emit to everyone (include self)
        io.emit('newMessage', generateMessage(message.from, message.text));

        // == emit to everyone (expect self)
        // socket.broadcast.emit('newMessage', {
        //     from : message.from,
        //     text : message.text,
        //     createdAt : new Date().getTime()
        // });

    });

    socket.on('createLocationMessage', (message) => {
        io.emit('newLocationMessage', generateLocationMessage(message.from, message.lat, message.lng))
    })


    socket.on('disconnect', () => {
        console.log('User has been disconnected');
    })
})


server.listen(port, () => {
    console.log(`Server is up on port : ${port}`);
})
