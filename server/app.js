const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const app = express()

const PORT = process.env.PORT || 5000

app.use(bodyParser.json());

const server = http.createServer(app)

server.listen(PORT, () => {
    console.log(`Server is listening to port ${PORT}`)
})

