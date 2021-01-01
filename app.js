const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const app = express()
const socketIO = require('socket.io');

const port = process.env.PORT || 5000;

app.use(bodyParser.json());

const server = http.createServer(app)

const io = socketIO(server, {
    cors: {
        origin: "*"
    },
})

app.post("/signup", (req, res) => {

})


app.get("/", (req, res) => {
    res.status(200).send({
        message: "Welcome to server"
    })
    console.log("Welcome to server")
    io.on('connection', (socket) => {
        console.log("Socket is connected with id : ", socket.id)
        res.send({
            message: "You are connected to server"
        })
    })
})

app.post("/tweet", (req, res) => {
    req

})




server.listen(port, () => {
    console.log(`Server is listening to port ${PORT}`)
})

