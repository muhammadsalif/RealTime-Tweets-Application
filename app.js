const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const app = express()
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require("bcrypt-inzi")
const jwt = require('jsonwebtoken');

const SERVER_SECRET = process.env.SECRET || "1234";

const port = process.env.PORT || 5000;

app.use(bodyParser.json());
/////////////////////////////////////////////////////////////////////////
// Mongoose connections
let dbURI = "mongodb+srv://dbuser:dbpassword@cluster0.lxign.mongodb.net/tweetsdatabase?retryWrites=true&w=majority"

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on("connected", () => {
    console.log("Mongoose is connected")
})

mongoose.connection.on("disconnected", () => {
    console.log("Mongoose disconnected")
    process.exit(1);
})

mongoose.connection.on('error', function (err) {//any error
    console.log('Mongoose connection error: ', err);
    process.exit(1);
});

process.on('SIGINT', function () {/////this function will run jst before app is closing
    console.log("app is terminating");
    mongoose.connection.close(function () {
        console.log('Mongoose default connection closed');
        process.exit(0);
    });
});
/////////////////////////////////////////////////////////////////////////
// Db Schemas

var userSchema = new mongoose.Schema({
    userName: { type: String },
    password: { type: String },
    email: { type: String }
})
var users = mongoose.model("users", userSchema);

var tweetsSchema = mongoose.Schema({
    tweet: { type: String, },
    userName: { type: String, },
})
var tweets = mongoose.model("tweets", tweetsSchema);


var sessionsSchema = mongoose.Schema({
    token: { type: String, },
    userName: { type: String, },
})
var sessions = mongoose.model("sessions", sessionsSchema);


/////////////////////////////////////////////////////////////////////////
const server = http.createServer(app)

const io = socketIO(server, {
    cors: {
        origin: "*"
    },
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

app.post("/signup", (req, res) => {
    if (!req.body || !req.body.email || !req.body.userName || !req.body.password) {
        res.status(403).send(`
        please provide userName, password in json body.
        e.g:
        {
            "userName": "Mark",
            "email": "abc@abc.com",
            "password": "abc",
        }`)
    } else {
        users.findOne({ email: req.body.email }, (err, doc) => {
            if (!doc) {
                bcrypt.stringToHash(req.body.password)
                    .then(passwordHash => {
                        console.log("hash: ", passwordHash);
                        users.create({
                            userName: req.body.userName,
                            password: passwordHash,
                            email: req.body.email
                        }, function (err, success) {
                            if (err) {
                                console.log("Internal error", err)
                                res.status(500).send({
                                    message: "Internal Error"
                                })
                            }
                            if (success) {
                                console.log("User created successfully ", success)
                                res.status(200).send({
                                    message: "User created successfully"
                                })
                            }
                        })
                    })
            }
            if (doc) {
                console.log("Email already exists please try with another email")
                res.status(409).send({
                    message: "Email already exists please try with another email"
                })
            }
            if (err) {
                console.log("Internal Error")
                res.status(500).send({
                    message: "Internal Error"
                })
            }
        })
    }
})

app.post("/login", (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.status(403).send(`
        please provide userName, password in json body.
        e.g:
        {
            "email": "abc@abc.com",
            "password": "1234",
        }`)
    }
    users.findOne({ email: req.body.email }, (err, user) => {
        if (user) {
            bcrypt.varifyHash(req.body.password, user.password)
                .then(isMatched => {
                    if (isMatched) {

                        let tokenData =
                            jwt.sign({
                                id: user._id,
                                name: user.userName,
                                email: user.email,
                                ip: req.socket.remoteAddress
                            }, SERVER_SECRET, { expiresIn: "1h" })

                        sessions.create({
                            token: tokenData,
                            userName: user.userName
                        })

                        res.status(200).send({
                            message: "Login  successfully",
                            token: tokenData
                        })
                        console.log(req.body.email, "Login successfully");
                    } else {
                        res.status(403).send({
                            message: "Password is incorrect"
                        })
                        console.log("Password Hash is not matched");
                    }
                })
                .catch(e => {
                    res.status(500).send({
                        message: "Internal Error"
                    })
                    console.log("Internal error ", e)
                })
        }
        if (!user) {
            res.status(404).send({
                message: "Email does not exists kindly signup first"
            })
        }
        if (err) {
            res.status(500).send({
                message: "Internal Error"
            })
        }
    })
})

app.get("/dashboard", (req, res) => {
    if (!req.headers.token) {
        res.status(400).send(`
        please provide token in headers.
        e.g:
        {
            "token": "1321xdbza2c5dafg",
        }`)
        return;
    }
    sessions.findOne({ token: req.headers.token }, (err, user) => {
        if (user) {
            jwt.verify(user.token, SERVER_SECRET, (err, decodedData) => {
                if (decodedData.exp > new Date().getTime()) {
                    res.status(440).send({
                        message: "Session expired kindly login again"
                    })
                    return;
                }
                if (err) console.log("Decoded data Error:", err)

                res.status(200).send({
                    message: "Welcome to profile"
                })
                console.log(user.userName, "Welcome to Profile")
            });
        }
        if (!user) {
            res.status(400).send({
                message: 'Token is not valid'
            })
            console.log("Can't find token")
        }
        if (err) {
            res.status(500).send({
                message: 'Internal Error'
            })
            console.log("Internal Server Error")
        }
    })
})

app.post("tweet", (req, res) => {
    if (!req.body.tweet || !req.body.userName) {
        res.status(449).send({
            message: "Tweet is missing"
        })
        return;
    }
    tweets.create({
        userName: req.body.userName,
        tweet: req.body.tweet
    }, (err, success) => {
        if (err) console.log("Tweets posting error"); res.status(500).send({ message: "Tweets posting error try again later" })
        if (success) console.log("Tweets posted successfully"); res.status(200).send({ message: "Tweets posted successfully" })
    })
})

app.get("tweets", (req, res) => {
    tweets.find({}, (err, success) => {
        if (err) console.log("Internal Error"); res.status(500).send({ message: "Internal Error" })
        if (success) res.status(200).send({ message: "All Tweets", success })
    })
})

server.listen(port, () => {
    console.log(`Server is listening to port ${port}`)
})

