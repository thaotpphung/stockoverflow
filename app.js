let express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  flash = require("connect-flash"),
  methodOverride = require("method-override"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  // passportLocalMongoose = require("passport-local-mongoose"),
  // Stock           = require("./models/stock"),
  User = require("./models/user");
// Purchase        = require("./models/purchase"),
// StockSearch     = require("./models/stocksearch")
// seedDB          = require("./seeds")

// requring routes
let purchaseRoutes = require("./routes/purchases"),
  stockRoutes = require("./routes/stocks"),
  portfolioRoutes = require("./routes/portfolio"),
  userRoutes = require("./routes/users"),
  indexRoutes = require("./routes/index");

mongoose.connect("mongodb://127.0.0.1/stockapp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(flash());
// seedDB();

// PASSPORT CONFIGURATION
app.use(
  require("express-session")({
    secret: "A random message 1099",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
// local-mongoose package
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/stocks/:userid", stockRoutes);
app.use("/users/:userid", userRoutes);
app.use("/portfolio/:userid", portfolioRoutes);
app.use("/stocks/:userid/:stockid/purchases", purchaseRoutes);
app.use("/", indexRoutes);

let port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Stock App Server Has Started!");
});
