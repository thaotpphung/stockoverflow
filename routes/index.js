var express = require("express");
var router  = express.Router({mergeParams: true});
var passport = require("passport");
var User = require("../models/user");

// root route
router.get("/", function(req, res) {
    res.render("landing");
});

// === AUTH ===
// show register form
router.get("/register", function(req, res){
    res.render("register"); 
 });

 //handle sign up logic
 router.post("/register", function(req, res){
     var newUser = new User({username: req.body.username});
     // check unique valid user name here 
     User.register(newUser, req.body.password, function(err, user){ // encode the password 
         if(err){
             console.log(err);
             return res.render("register");
         } 
         passport.authenticate("local")(req, res, function(){ // log user in, serialize session
            res.redirect("/"); 
         });
     });
 });
 
 // show login form
 router.get("/login", function(req, res){
    res.render("login"); 
 });

 // handling login logic
 router.post("/login", passport.authenticate("local", 
     {
        successRedirect: "/",
        failureRedirect: "/login"
     }), function(req, res){
        res.redirect("/");
 });
 
 // logout route
 router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
 });
 
//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;
