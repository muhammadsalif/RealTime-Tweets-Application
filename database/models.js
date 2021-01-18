const mongoose = require('mongoose');

/////////////////////////////////////////////////////////////////////////
// Mongoose connections
let dbURI = "mongodb+srv://dbuser:dbpassword@cluster0.lxign.mongodb.net/tweetsdatabase"
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on("connected", () => {
    console.log("Mongoose is connected")
})

mongoose.connection.on("disconnected", (err) => {
    console.log("Mongoose disconnected", err)
    process.exit(1);
})

mongoose.connection.on('error', function (err) {//any error
    console.log('Mongoose connection error: ', err);
    process.exit(1);
});

process.on('SIGINT', function () {  //this function will run jst before app is closing
    console.log("app is terminating");
    mongoose.connection.close(function () {
        console.log('Mongoose default connection closed');
        process.exit(0);
    });
});
/////////////////////////////////////////////////////////////////////////
// Db Schemas & Models

var userSchema = new mongoose.Schema({
    userName: { type: String },
    email: { type: String },
    password: { type: String },
    createdOn: { type: Date, default: Date.now },
});

var usersModel = mongoose.model("users", userSchema);

var otpSchema = new mongoose.Schema({
    email: { type: String },
    otpCode: { type: String },
    createdOn: { type: Date, default: Date.now },
});

var otpModel = mongoose.model("otps", otpSchema);

var tweetSchema = new mongoose.Schema({
    tweet: { type: String },
    userName: { type: String },
    createdOn: { type: Date, default: Date.now },
});

var tweetsModel = mongoose.model("tweets", tweetSchema);

module.exports = {
    usersModel,
    otpModel,
    tweetsModel,
}
