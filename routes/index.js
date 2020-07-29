const express = require("express"),
  router = express.Router({ mergeParams: true }),
  passport = require("passport"),
  async = require("async"),
  nodemailer = require("nodemailer"),
  crypto = require("crypto"),
  User = require("../models/user"),
  StockSearch = require("../models/stocksearch"),
  got = require("got"),
  Stock = require("../models/stock");
require("dotenv").config();

router.get("/test", async (req, res) => {
  const stocks = await StockNyse.find({});
  stocks.forEach( async (stock) => {
    const api_url = "https://financialmodelingprep.com/api/v3/historical-price-full/"+ stock.symbol + "?timeseries=30&apikey=" + process.env.API_KEY;
    const rawData = await got(api_url);
    const data = JSON.parse(rawData.body);
    if (Object.keys(data).length === 0) {
      await StockNyse.remove({symbol: stock.symbol});
      console.log(stock.symbol);
    }
  });
});

// root route
router.get("/", (req, res) => {
  res.render("landing");
});

// get search route
router.post("/search", (req, res) => {
  console.log('search', req.body.symbol);
  StockSearch.find({ symbol: { $regex: req.body.symbol } }, (err, foundStock) => {
    if (foundStock.length > 0) {
      res.json({ foundStock });
    } else {
      res.json ({ foundStock: null });
    }
  });
});

// get price route
router.post("/getStock", (req, res) => {
  console.log("getStock", req.body.symbol);
  Stock.findOne({ symbol: req.body.symbol.toUpperCase() }, (err, foundStock) => {
    if (foundStock == null) {
      res.json ({ foundStock: null });
    } else {
      res.json({ foundStock });
    }
  });
});

// router.post("/update", async (req, res) => {
//   console.log(req.body);
//   let query = req.body.query.split(",");
//   let response = await getStocks(query);
//   res.json(response);
// });

// function getStocks (query) {
//   return new Promise( async (resolve, reject) => {
//     var re = [];
//     for (i = 0; i < query.length; i ++){
//       var foundStock = await Stock.findOne({symbol: query[i]});
//       re.push(foundStock);
//       if (i === (query.length - 1)) {
//         resolve(re);
//       }
//     }
//   });
// }


// === AUTH ===
// show register form
router.get("/register", (req, res) => {
  res.render("register");
});

//handle sign up logic
router.post("/register", (req, res) => {
  let newUser = new User(req.body
  );
  // check unique valid user name here
  User.findOne({username: req.body.username}, (err, foundUser) => {
    if (!foundUser) {
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
    } else {
      req.flash("error", "Username " + req.body.username + " already exists, please choose a different one." );
      res.redirect("back");
    }
  })
});

// show login form
router.get("/login", (req, res) => {
  res.render("login");
});

// handling login logic
router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  }), (req, res) => {
    res.redirect("/");
  }
);

// logout route
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Logged you out!");
  res.redirect("/");
});

// show forgot password form
router.get("/forgot", (req, res) => {
  res.render("forgot");
});

// handling forgot password logic
router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'stockoverflow.stockapp@gmail.com',
          pass: process.env.GMAIL_PW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'stockoverflow.stockapp@gmail.com', // email that users can reply to
        subject: 'STOCKOVERFLOW Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
          // host: website host
          // token: for server to verify
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    // waterfall: array of functions that gets called in sequence
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        // $gt => greater than date
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'stockoverflow.stockapp@gmail.com',
          pass: process.env.GMAIL_PW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'stockoverflow.stockapp@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});

router.get("*", function (req, res) {
  res.status(404).render("errorpage");
});

module.exports = router;
