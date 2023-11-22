//express
const express = require("express");
const path = require("path");
const port = 3000;
const app = express();
//ejs
const ejs = require('ejs');
app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
//server mongoose/ mongodb & bodyparse
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
//password hatcher
const bcryptjs = require('bcryptjs');
//Passportjs stuff
// const crypto = require('crypto');
// const passport = require('passport');
// const LocalStrategy = require('passport-local');
// const passportLocalMongoose = require('passport-local-mongoose');

//Body parser stuff
app.use(bodyParser.urlencoded({ extended: true }));

//Public Routes (css)
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/members-only-proj', {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
}, console.log("connected to database"));

//Catches mongodb connection error
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const UsersModel = mongoose.model('Users', new mongoose.Schema({
    // Define your data schema here
    email: { type: String, required: true},
    password: { type: String, required: true },
    admin: {type: Boolean}
    // Add more fields as needed
}));


//Routes
app.get('/signUp', function (req, res) {
    res.render('sign-up');
})
app.get('/error', function (req, res) {
    res.render('errorSignUp');
})
app.get('/logIn', function (req, res) {
    res.render('log-in');
})
app.get('/secretPass', function (req, res) {
    res.render('secret-pass');
})
app.get('/chat', function (req, res) {
    res.render('members-only-chat', {messageBoard: messageBoard});
})


//Sign Up
    app.post("/sign-up", async (req, res, next) => {//Post needs to be the same as the file page location
        try {
                if (req.body.password != req.body.confirmPassword ) {
                    console.log("Password and Confirm Password do not match");
                    res.redirect("error");
                    return;
            }
            const hashedPassword = await bcryptjs.hash(req.body.password, 13);
            const users = new UsersModel({
                email: req.body.email,
                password: hashedPassword,
                admin: false
            });
            const result = await users.save();
            res.redirect("logIn");
            console.log(result);
        } catch (err) {
            console.log("Error");
            res.redirect("error");
            return next(err);
            };
    });



// Log-in
app.post("/log-in", async function(req, res){ 
    try {// check if the user exists 
        const usersEmail = await UsersModel.findOne({ email: req.body.email });
        console.log(usersEmail);
        if (usersEmail) { //check if password matches 
            const comparePass = await bcryptjs.compare(req.body.password, users.password)
            // const result = req.body.password === users.password;
            if (comparePass) {
                username.push(usersEmail);
                res.redirect("chat");
            } else {
                res.redirect("logIn");
                console.log("password doesn't match");
                // res.status(400).json({ error: "password doesn't match" });
            }
        } else {
            res.redirect("logIn");
            console.log("User doesn't exist");
            // res.status(400).json({ error: "User doesn't exist" });
        }
    } catch (error) { 
        console.log(error)
        res.redirect("error");
        // res.status(400).json({ error }); 
    } 
}); 

//Message Board
const username = ["happy"];
const messageBoard = [];
app.post("/members-chat", async function (req, res, next) {
    const message = req.body.message;
    messageBoard.push({ user: username, text: message });
    console.log(username);
    console.log(messageBoard);
    res.redirect("chat");
});


app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}/signUp`);
});