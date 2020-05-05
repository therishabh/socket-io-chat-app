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

    socket.emit('newMessage', {
        from : "Admin",
        text : "Welcome to archchat Chat box",
        createdAt : new Date().getTime()
    });

    socket.broadcast.emit('newMessage', {
        from : 'Admin',
        text : "New User Joined",
        createdAt : new Date().getTime()
    })

    
    // socket.emit('newMessage', {
    //     name : "Lorem",
    //     text : "Hello Lorem"
    // });

    // listen event
    socket.on('createMessage', (message) => {
        console.log('Create Message', message);

        // == emit to everyone (include self)
        // io.emit('newMessage', {
        //     from : message.from,
        //     text : message.text,
        //     createdAt : new Date().getTime()
        // });

        // == emit to everyone (expect self)
        // socket.broadcast.emit('newMessage', {
        //     from : message.from,
        //     text : message.text,
        //     createdAt : new Date().getTime()
        // });

    });


    socket.on('disconnect', () => {
        console.log('User has been disconnected');
    })
})


server.listen(port, () => {
    console.log(`Server is up on port : ${port}`);
})
