const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', function (req, res) {
    res.render('index.ejs');
});

io.sockets.on('connection', function (socket) {
    io.emit("is_online", `new user connected: ${socket.conn.remoteAddress}`)

    socket.on('username', function (username) {
        socket.username = username;
        io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
    });

    socket.on('disconnect', function (username) {
        io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
        socket.leaveAll()
    })

    socket.on('chat_message', function (message) {
        console.log(socket);

        if (socket.username) {
            io.emit('chat_message', '<strong>' + socket.username + "(" + socket.conn.remoteAddress + ")" + '</strong>: ' + message);
        } else {
            socket.emit("no_user_name", "");
        }
    });
});

const server = http.listen(8080, function () {
    console.log('listening on *:8080');
});