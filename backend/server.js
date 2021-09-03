require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

server.listen(process.env.PORT, hostname => {
    console.log(`listening on *:${process.env.PORT}`);
})
