const express = require("express");
const path = require("path");
const port = 3000;
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

//Body parser stuff
app.use(bodyParser.urlencoded({ extended: true }));

//Routes
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/members-only-proj', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, console.log("connected to database"));

//Catches mongodb connection error
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const UsersModel = mongoose.model('Users', new mongoose.Schema({
    // Define your data schema here
    email: { type: String, required: true},
    password: { type: String, required: true},
    // Add more fields as needed
}));


    app.post("/sign-up.html", async (req, res, next) => {//Post needs to be the same as the file page location
        try {
            if (req.body.password !== req.body.confirmPassword) {
                // Password and Confirm Password do not match
                    // const pErrorText = document.getElementById("signup-error-p");
                    // pErrorText.textContent = "Password and Confirm Password do not match";
                    console.log("Password and Confirm Password do not match");
                res.redirect("sign-up.html");
                return;
            }
            const users = new UsersModel({
                email: req.body.email,
                password: req.body.password
            });
            const result = await users.save();
            res.redirect("log-in.html");
            console.log(result);
        } catch (err) {
            console.log("Error");
            res.redirect("sign-up.html");
            return next(err);
            };
    });


app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}/sign-up.html`)
});