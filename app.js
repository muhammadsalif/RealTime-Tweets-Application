const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const app = express()
const socketIO = require('socket.io');
const mongoose = require('mongoose');

const port = process.env.PORT || 5000;

app.use(bodyParser.json());
/////////////////////////////////////////////////////////////////////////
// Mongoose connections
const dbURI= "mongodb://tweetsdbuser:tweetsdbpassword@cluster0-shard-00-00.em7xy.mongodb.net:27017,cluster0-shard-00-01.em7xy.mongodb.net:27017,cluster0-shard-00-02.em7xy.mongodb.net:27017/admin?ssl=true&replicaSet=atlas-o043up-shard-0&readPreference=primary&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1&3t.uriVersion=3&3t.connection.name=Tweets+Database&3t.databases=admin,tweetsdbuser&3t.alwaysShowAuthDB=true&3t.alwaysShowDBFromUserRole=true&3t.sslTlsVersion=TLS"

mongoose.connect(dbURI, {useNewUrlParser: true});






/////////////////////////////////////////////////////////////////////////
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
    console.log(`Server is listening to port ${port}`)
})

