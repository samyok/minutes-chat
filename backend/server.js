require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server, {
    cors: [
        "hours.samyok.us",
        "localhost:3000"
    ]
});

app.get('/', (req, res) => {
    res.json({status: "service is up"});
});

io.on('connection',async (socket) => {
    let auth = socket.handshake.auth;
    console.debug('connection:', auth);

    socket.join(auth.room);

    let newPeople = await getPeopleInRoom(auth.room);
    io.to(auth.room).emit("join", {person: auth, newPeople});

    socket.on("chat", data => {
        io.to(auth.room).emit("chat", {...data, time: new Date().toISOString()});
    })
    socket.on('disconnect', async () => {
        let newPeople = await getPeopleInRoom(auth.room);
        io.to(auth.room).emit("leave", {person: auth, newPeople})
    });
});

async function getPeopleInRoom(roomID) {
    let sockets = await io.in(roomID).fetchSockets();
    return sockets.map(s => s.handshake.auth)
}

server.listen(process.env.PORT, hostname => {
    console.log(`listening on *:${process.env.PORT}`);
})
