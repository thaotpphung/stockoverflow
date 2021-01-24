const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  flash = require("connect-flash"),
  methodOverride = require("method-override"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  GoogleStrategy = require("passport-google-oauth2").Strategy,
  User = require("./models/user");
  
  require("dotenv").config();


// requring routes
let transactionRoutes = require("./routes/transactions"),
  stockRoutes = require("./routes/stocks"),
  userRoutes = require("./routes/users"),
  alertRoutes = require("./routes/alerts"),
  authRoutes = require("./routes/auth");
  subscriptionRoutes = require("./routes/subscriptions");
  indexRoutes = require("./routes/index");

const dbURL = process.env.MONGODB_URI || "mongodb://127.0.0.1/stockapp"
mongoose.connect(dbURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
}).then(() => {
  console.log("Connected to DB!")
}).catch(err => {
  console.log(err.message);
});

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(flash());

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
 
passport.use('google', new GoogleStrategy({
  clientID:     process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_LOCAL,
  passReqToCallback   : true
}, function(request, accessToken, refreshToken, profile, done) {
    User.findOne( {googleid: profile.id } , function(err, user) {
      if (err) {
        console.log('err in findone', err)
          return done(err);
      }
      if (!user) {
        console.log('create new user')
        user = new User({
          firstname: profile.given_name,
          lastname: profile.family_name,
          email: profile.emails[0].value,
          username: profile.emails[0].value,
          googleid: profile.id
        }); 
        user.save(function(err) {
          if (err) console.log('err in save', err);
          return done(err, user);
        });
      } else {
        console.log('found user')
          //found user. Return
          return done(err, user);
      }
    });
  }
)); 

passport.use('local', new LocalStrategy(User.authenticate()));

passport.serializeUser((user, done) => {
  done(null, user.id); //user.id is the id from Mongo
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    if (err) {
      done('pass');
    } else {
      done(null, user);
    }
  })
});

passport.deserializeUser((user, done) => {
  User.deserializeUser();
});


app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/users/:userid", userRoutes);
app.use("/users/:userid/subscriptions", subscriptionRoutes)
app.use("/users/:userid/stocks", stockRoutes);
app.use("/users/:userid/alerts", alertRoutes);
app.use("/users/:userid/transactions", transactionRoutes);
app.use("/", authRoutes);
app.use("/", indexRoutes);

let port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log("Stock App Server Has Started!");
});
