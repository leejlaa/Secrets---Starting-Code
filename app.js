//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose =require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();
mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser:true });

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


userSchema.plugin(encrypt,{ secret: process.env.SECRET , encryptedFields: ["password"]});


const User = new mongoose.model("User",userSchema);

const admin = new User({
    email: "admin@gmail.com",
    password: 123456
})

app.get("/", function(req,res){
    res.render("home.ejs");
});

app.get("/login", function(req,res){
    res.render("login.ejs");
});

app.get("/register", function(req,res){
    res.render("register.ejs");

});

app.post("/register", function(req,res){
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save().then(() => { // here will the password be encrypted.

        console.log('User added to DB.');
    
        res.render('login');
    
      })
    
      .catch(err => {
    
        res.status(400).send("Unable to save post to database.");
    
      });

});

app.post("/login", function(req,res){
    
const getUsers = async () => {
    try {
      const users = await User.find({}); // here the password is decrypted.
      return users;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  
  // Use the async function to get items and print their names
  getUsers()
    .then(users => {
        if(users.length == 0){
            admin.save()
            res.redirect("/");
        }
        console.log(users);
       users.forEach(user => {
            if(user.email == req.body.username && user.password == req.body.password){
                console.log("User found with a correct password, proceed ahead..");
                res.render("secrets.ejs");
            } 
       });
    })
    .catch(error => console.error(error));
    
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
  });