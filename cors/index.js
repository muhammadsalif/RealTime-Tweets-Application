const port = process.env.PORT || 5000;
var SERVER_SECRET = process.env.SERVER_SECRET || "1234"
module.exports = {
    port,
    SERVER_SECRET
}