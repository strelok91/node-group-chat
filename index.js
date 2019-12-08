const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('public'))

app.get('/', function (req, res) {
    res.render('index.ejs');
});

io.sockets.on('connection', function (socket) {
    console.log(`Connectes sockets: ${Object.keys(io.sockets.sockets).length}`)
    if (Object.keys(io.sockets.sockets).length > 2) {
        socket.disconnect()
    }

    io.emit("is_online", `new user connected: ${socket.conn.remoteAddress}`)
    console.log(socket.conn.remoteAddress)

    socket.on('userName', function (userData) {

        socket.userName = userData.userName;
        socket.publicKey = userData.publicKey;

        console.log(`${socket.conn.remoteAddress} - ${socket.userName}`)

        setTimeout(() => {
            var userKeys = Object.values(io.sockets.sockets).map(m => {
                return { userName: m.userName, publicKey: m.publicKey }
            })

            io.emit('is_online', '🔵 <i>' + socket.userName + ' join the chat..</i>');
            io.emit('users', userKeys)
        }, 10)
    });

    socket.on('disconnect', function (username) {
        io.emit('is_online', '🔴 <i>' + socket.userName + ' left the chat..</i>');
        socket.leaveAll()
    })

    socket.on('chat_message', function (message) {
        if (socket.userName) {
            var userSocket = Object.values(io.sockets.sockets).find(m => m && m.userName == message.userName)

            if (userSocket) {
                userSocket.emit('chat_message', { userName: socket.userName, appendText: '<strong>' + socket.userName + '</strong>: ', text: message.text })
            }
        } else {
            socket.emit("no_user_name", "");
        }
    });
});

const server = http.listen(8080, function () {
    console.log('listening on *:8080');
});