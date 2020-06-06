var express      = require("express"),
    app          = express(),
    bodyParser   = require("body-parser"),
    mongoose     = require('mongoose'),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    // passportLocalMongoose = require("passport-local-mongoose"),
    Stock = require("./models/stock"),
    User        = require("./models/user"),
    seedDB      = require("./seeds");
// var request = require("request"); // for API 

mongoose.connect('mongodb://127.0.0.1/stockapp', {useNewUrlParser: true, useUnifiedTopology: true});
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set ("view engine", "ejs");
// seedDB();
 
// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "A random message 1099",
    resave: false, 
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
// local-mongoose package
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
    res.render("landing");
});

// INDEX - show all tracked stocks
app.get("/dashboard", function (req, res){
    // get all tracked stocks from DB
    Stock.find({}, function(err, allStocks){
        if(err){
            console.log(err);
        } else {
            res.render("dashboard/index", {stocks: allStocks});
        }
    });
    
})

// CREATE - add new tracked stock to DB
app.post("/dashboard", function (req, res) {
    var name = req.body.name;
    var description = req.body.description;
    var newStock = {name:name, description:description};
    // create new stock and save to DB
    Stock.create(newStock, function(err, stock){
        if(err){
            console.log(err);
        } else {
            res.redirect("/dashboard");
        }
    });
})

// NEW - show form to create new tracked stock
app.get("/dashboard/new", function(req, res) {
    res.render("dashboard/new");
})

app.get("/dashboard/:id", function(req, res) {
    Stock.findById(req.params.id, function(err, foundStock){
        if(err){
            console.log(err);
        } else {
            //render show template with that campground
            res.render("dashboard/show", {stock: foundStock});
        }
    });
})

// === AUTH ===

// show register form
app.get("/register", function(req, res){
    res.render("register"); 
 });
 //handle sign up logic
 app.post("/register", function(req, res){
     var newUser = new User({username: req.body.username});
     User.register(newUser, req.body.password, function(err, user){ // encode the password 
         if(err){
             console.log(err);
             return res.render("register");
         } 
         passport.authenticate("local")(req, res, function(){ // log user in, serialize session
            res.redirect("/dashboard"); 
         });
     });
 });
 
 // show login form
 app.get("/login", function(req, res){
    res.render("login"); 
 });
 // handling login logic
 app.post("/login", passport.authenticate("local", 
     {
         successRedirect: "/dashboard/new",
         failureRedirect: "/login"
     }), function(req, res){
 });
 
 // logic route
 app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
 });
 
 function isLoggedIn(req, res, next){
     if(req.isAuthenticated()){
         return next();
     }
     res.redirect("/login");
 }


var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Stock App Server Has Started!");
});
