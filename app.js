var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require('mongoose'),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    // passportLocalMongoose = require("passport-local-mongoose"),
    request = require("request"); // for API 
    Stock           = require("./models/stock"),
    User            = require("./models/user"),
    Purchase        = require("./models/purchase"),
    seedDB          = require("./seeds");

// requring routes
var purchaseRoutes  = require("./routes/purchases"),
    dashboardRoutes = require("./routes/dashboard"),
    portfolioRoutes = require("./routes/portfolio"),
    indexRoutes     = require("./routes/index")

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

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

app.use("/", indexRoutes);
app.use("/dashboard/:userid", dashboardRoutes);
app.use("/portfolio/:userid", portfolioRoutes);
app.use("/dashboard/:userid/:stockid/purchases", purchaseRoutes);

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Stock App Server Has Started!");
});
