const express = require("express");
const path = require("path");
const port = 3000;
const app = express();
//server mongoose/ mongodb & bodyparse
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
//password hatcher
const bcryptjs = require('bcryptjs');
//Passportjs
const passport = require('passport');
const LocalStrategy = require('passport-local');

//Body parser stuff
app.use(bodyParser.urlencoded({ extended: true }));

//Routes
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

//Sign Up
    app.post("/sign-up.html", async (req, res, next) => {//Post needs to be the same as the file page location
        try {
                if (req.body.password != req.body.confirmPassword ) {
                    console.log("Password and Confirm Password do not match");
                    res.redirect("errorSignUp.html");
                    return;
                }
            const users = new UsersModel({
                email: req.body.email,
                password: req.body.password,
                admin: false
            });
            const result = await users.save();
            res.redirect("log-in.html");
            console.log(result);
        } catch (err) {
            console.log("Error");
            res.redirect("errorSignUp.html");
            return next(err);
            };
    });



// Log-in
app.post("/log-in",
    passport.authenticate("local", {
        successRedirect: "secret-pass",
        failureRedirect: "log-in"
    })
);

// app.post("/log-in", async (req, res, next) => {
//     try {
//         res.redirect("secret-pass.html")
//     } catch (err) {
//         console.log("Error on log-in post");
//         return next(err);
//     };
// });

// passport.use(
//     new LocalStrategy(async (email, password, done) => {
//     try {
//         const users = await UsersModel.findOne({ username: email });
//         if (!users) {
//             return done(null, false, { message: "Incorrect email" });
//         };
//         if (users.password !== password) {
//             return done(null, false, { message: "Incorrect password" });
//         };
//             return done(null, users);
//         } catch(err) {
//             return done(err);
//         };
//     })
// );

// passport.serializeUser((users, done) => {
//     done(null, users.id);
// });

// passport.deserializeUser(async (id, done) => {
//     try {
//         const user = await UsersModel.findById(id);
//         done(null, user);
//     } catch(err) {
//         done(err);
//     };
// });

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}/sign-up.html`)
});