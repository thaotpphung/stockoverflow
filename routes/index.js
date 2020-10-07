const user = require("../models/user");

const express = require("express"),
  router = express.Router({ mergeParams: true }),
  passport = require("passport"),
  // require sendgrid/mail
  sgMail = require('@sendgrid/mail'),
  crypto = require("crypto"),
  User = require("../models/user"),
  StockSearch = require("../models/stocksearch"),
  StockMarket = require("../models/stockmarket")
  got = require("got"),
  Stock = require("../models/stock");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// root route
router.get("/", async (req, res) => {
  const stockmarket = await StockMarket.findOne();
  res.render("landing", {stockmarket});
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

// show register form
router.get("/register", (req, res) => {
  res.render("register");
});

//handle sign up logic
router.post("/register", (req, res) => {
  // check unique valid user name here
  if (req.body.password == req.body.confirm) {
    User.find( {$or: [ {username: req.body.username},{email: req.body.email}]}, (err, foundUser) => {
      if (foundUser.length == 0) {
        let newUser = new User(req.body);
        User.register(newUser, req.body.password, (err, user) => {
          // encode the password
          if (err) {
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
        req.flash("error", "Username or email is already in used, please choose a different one." );
        res.redirect("back");
      }
    })
  } else {
    req.flash("error", "Password doesn't match" );
    res.redirect("back");
  }
});

// show login form
router.get("/login", (req, res) => {
  res.render("login");
});

// handling login logic
router.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }), (req, res) => {
    req.flash("success", "Successfully logged in!");
    if (user.isAdmin) {
      res.render("admin/index");
    } else {
      res.redirect("/");
    }
  }
);

// show admin log in page
router.get("/admin", (req, res) => {
  res.render("adminlogin");
});

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

// forgot functions. crypo.randombytes does not support promises by default
// so we have to "promisify" it.
var generateResetToken = () => {
	return new Promise((resolve, reject) => {
		// crypto random bytes has a callback.
		// randombytes(size[, callback])
		crypto.randomBytes(20, (err, buf) => {
			if (err) reject(err);
			else {
				let reset_token = buf.toString('hex');
				resolve(reset_token);
			}
		})
	})
}



// NEW forgot post
router.post('/forgot', async (req, res) => {
	try {
		// generate reset token to send.
		let reset_token = await generateResetToken();
		// find the specified user by email.
		let user = await User.findOne({email: req.body.email});
		if (!user) {
      req.flash('error', 'No account with that email address.');
			throw 'user not found.'
		}
		user.resetPasswordToken = reset_token;
		user.resetPasswordExpires = Date.now() + 3600000; // 1 hour in ms
		// passport local mongoose allows for promises inherently.
		await user.save();

    // send email here
    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD
      }
    });

    var mailOptions = {
      from: 'stockoverflow.ad@gmail.com',
      to: user.email,
      subject: 'StackOverflow Password Reset',
      text:  'You are receiving this because you (or someone else) have requested the reset of the password linked to your StockOverflow account.' +
      'Please click on the following link, or paste this into your browser to complete the process.' + '\n\n' +
      'http://' + req.headers.host + '/reset/' + reset_token + '\n\n' + 
      'If you did not request this, please ignore this email and your password will remain unchanged.'
    };

    try {
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      req.flash('success', 'An email has been sent to ' + user.email + ' with further instructions.');
      res.redirect('/forgot');
    } catch (error) {
      console.log(error);
      req.flash('error', 'Sorry, something went wrong, please contact admin@website.com');
      res.redirect('back');
    }
	} catch (error) {
		console.log(error);
		res.redirect('/forgot');
	}	
});

// show reset form
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

// handling reset logic
router.post('/reset/:token', async function(req, res) {
  try {
    let user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now()}});
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('back');
    }
    if(req.body.password === req.body.confirm) {
      try {
        await user.setPassword(req.body.password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        
        // send email here
        var nodemailer = require('nodemailer');
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USERNAME,
            pass: process.env.GMAIL_PASSWORD
          }
        });

        var mailOptions = {
          from: 'stockoverflow.ad@gmail.com',
          to: user.email,
          subject: 'Successfully Changed Password',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });

        req.login(user, function(err) {
          if (err) {   
            console.log(err);
            req.flash('error', 'Sorry, something went wrong, please contact admin@website.com');
            return res.redirect('back');
          } else {
            req.flash('success', 'Success! Your password has been changed.');
            return res.redirect('/');
          }
        });
      } catch (error) {
        console.log(error);
        req.flash('error', 'Sorry, something went wrong, please contact admin@website.com');
        return res.redirect('back');
      }
    } else {
      req.flash("error", "Passwords do not match.");
      return res.redirect('back');
    }
	} catch (error) {
    console.log(error);
    req.flash('error', 'Sorry, something went wrong, please contact stockoverflow.stockapp@gmail.com');
		return res.redirect('/forgot');
	}	
});

router.get("*", function (req, res) {
  res.status(404).render("errorpage");
});

module.exports = router;
