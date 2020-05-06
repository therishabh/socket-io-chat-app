const path = require('path');
const http = require('http');
const publicPath = path.join(__dirname, './../public');
const express = require('express');
const socketIO = require('socket.io');
const port = process.env.PORT || 3000;
const { generateMessage, generateLocationMessage, isRealString } = require('./utils/message');
const { Users } = require('./utils/users');

var app = express();
let server = http.createServer(app)
let io = socketIO(server);
let users = new Users();

app.use(express.static(publicPath));



io.on('connection', (socket) => {
    console.log('A New user just connected');

    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Please enter valid Name and Room');
        }

        
        socket.join(params.room);
        users.removeUser(socket.id);
        let user = users.addUser(socket.id, params.name, params.room);

        io.to(params.room).emit('updateUserList', users.getUsers(params.room))

        // emit to self
        socket.emit('newMessage', generateMessage('Admin', `Welcome to ${params.room}`));

        // emit to other users
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${user.name} has join ${user.room}`))

        callback();
    });



    // listen event
    socket.on('createMessage', (message) => {
        console.log('Create Message', message);

        // == emit to everyone (include self)
        let user = users.getUser(socket.id);
        io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));

        // == emit to everyone (expect self)
        // socket.broadcast.emit('newMessage', {
        //     from : message.from,
        //     text : message.text,
        //     createdAt : new Date().getTime()
        // });

    });

    socket.on('createLocationMessage', (message) => {
        let user = users.getUser(socket.id);
        io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, message.lat, message.lng))
    });

    socket.on('createTypingMessage', (message) => {
        let user = users.getUser(socket.id);
        let textMsg = message.typing ? `${user.name} is typing` : '';
        socket.broadcast.to(user.room).emit('newTypingMessage', textMsg)
    })


    socket.on('disconnect', () => {
        let user = users.removeUser(socket.id);
        if(user){
            io.to(user.room).emit('newMessage', generateMessage("Admin", `${user.name} has left ${user.room}`));
            io.to(user.room).emit('updateUserList', users.getUsers(user.room))
        }
    })
})


server.listen(port, () => {
    console.log(`Server is up on port : ${port}`);
})
