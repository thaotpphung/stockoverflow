const express = require("express"),
  router = express.Router({ mergeParams: true }),
  passport = require("passport"),
  User = require("../models/user"),
  StockSearch = require("../models/stocksearch"),
  middleware = require("../middleware"),
  got = require("got");
require("dotenv").config();

// root route
router.get("/", (req, res) => {
  res.render("landing");
});

// root route
router.get("/search", middleware.isLoggedIn, (req, res) => {
  res.render("search");
});

// post search route
router.post("/search", middleware.isLoggedIn, (req, res) => {
  StockSearch.find({ symbol: req.body.searchTerm }, (err, foundStock) => {
    if (foundStock.length) {
      res.render("stocks/new", { searchTerm: req.body.searchTerm });
    } else {
      req.flash("error", "Can't find stock, please try again");
      res.redirect("back");
    }
  });
});

// === AUTH ===
// show register form
router.get("/register", (req, res) => {
  res.render("register");
});

//handle sign up logic
router.post("/register", (req, res) => {
  let newUser = new User({
    username: req.body.username,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
  });
  // check unique valid user name here
  User.register(newUser, req.body.password, (err, user) => {
    // encode the password
    if (err) {
      console.log("error in register", err);
      req.flash("error", err.message);
      return res.render("register");
    }
    passport.authenticate("local")(req, res, () => {
      // log user in, serialize session
      req.flash("success", "Welcome to Stockoverflow " + user.firstname);
      res.redirect("/");
    });
  });
});

// show login form
router.get("/login", (req, res) => {
  res.render("login");
});

// handling login logic
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

// logout route
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Logged you out!");
  res.redirect("/");
});

router.get("*", function (req, res) {
  res.status(404).render("errorpage");
});

module.exports = router;
