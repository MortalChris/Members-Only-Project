//express
const express = require("express");
const path = require("path");
const port = 3000;
const app = express();
// Express session
require('dotenv').config();
const session = require('express-session');
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
//date fns
const { format } = require('date-fns');

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

//session
app.use(session({
    secret: "temppassword",
    resave: true,
    saveUninitialized: true,
    maxAge: 3600000
}));

//Routes
app.get('/signUp', function (req, res) {
    res.render('sign-up', { emailExistError: emailExistError, errorMsg: "Email already exist", passwordErrorMsg: passwordErrorMsg });
})
app.get('/error', function (req, res) {
    res.render('errorSignUp');
})
app.get('/logIn', function (req, res) {
    res.render('log-in');
})
app.get('/logOut', function (req, res) {
    res.render('log-out');
})
app.get('/secretPass', function (req, res) {
    res.render('secret-pass');
})
app.get('/chat', function (req, res) {
    if (req.session.loggedin) { // will return true if user is logged in
        res.render('members-only-chat', {messageBoard: messageBoard});
        // next();
    } else {
        res.redirect("logIn");
    }
})

let emailExistError = false;
let passwordErrorMsg = "";
//Sign Up
    app.post("/sign-up", async (req, res, next) => {//Post needs to be the same as the file page location
        try {
                if (req.body.password != req.body.confirmPassword ) {
                    passwordErrorMsg = "Password and Confirm Password do not match";
                    res.redirect("signUp");
                    return;
                } else if(req.body.password.search(/[a-z]/) < 0){
                    passwordErrorMsg = "Password must contain atleast one lowercase letter";
                    res.redirect("signUp");
                    return;
                } else if (req.body.password.search(/[A-Z]/) < 0) {
                    passwordErrorMsg = "Password must contain atleast one upercase letter";
                    res.redirect("signUp");
                    return;
                } else if (req.body.password.search(/[0-9]/) < 0) {
                    passwordErrorMsg = "Password must contain atleast one number";
                    res.redirect("signUp");
                    return;
            }
            //Reset msg
            console.log("Password was entered correctly");
            passwordErrorMsg = "";

            const hashedPassword = await bcryptjs.hash(req.body.password, 13);
            const users = new UsersModel({
                email: req.body.email,
                password: hashedPassword,
                admin: false
            });
                const usersEmail = await UsersModel.findOne({ email: req.body.email });
                if (!usersEmail) {
                    const result = await users.save();
                    console.log(result);
                    res.redirect("logIn");
                    emailExistError = false;
                } else {
                    console.log("Error: Email already exist");
                    emailExistError = true;
                    res.redirect("signUp");
                }
        } catch (err) {
            console.log("err");
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
            const comparePass = await bcryptjs.compare(req.body.password, usersEmail.password);
            if (comparePass) {
                req.session.loggedin = true;
				req.session.username = usersEmail;
                res.redirect("chat");
            } else {
                res.redirect("logIn");
                console.log("password doesn't match");
            }
        } else {
            res.redirect("logIn");
            console.log("User doesn't exist");
        }
    } catch (error) { 
        console.log(error)
        res.redirect("error");
    } 
}); 

//Log out
app.post("/log-out", async function (req, res) { 
    req.session.loggedin = false;
    req.session.username = "";
    res.redirect(signUp);
})

//Message Board
const messageBoard = [];
app.post("/members-chat", async function (req, res, next) {
    const message = req.body.message;
    if (!req.session.username) {
        res.redirect("error");
        return;
    } else {
        messageBoard.push({ user: req.session.username.email, text: message , date: format(new Date(), "yyyy-MM-dd HH:mm:ss")});
    }
    console.log(req.session.username.email);
    console.log(messageBoard);
    res.redirect("chat");
});


app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}/signUp`);
});