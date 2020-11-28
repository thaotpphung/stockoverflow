const passport = require("passport"),
  crypto = require("crypto"),
  User = require("../models/user");
require("dotenv").config();

exports.showRegisterForm = (req, res) => {
  res.render("register");
}

exports.createUser = (req, res) => {
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
}

exports.showLoginForm = (req, res) => {
  res.render("login");
}

exports.login = (req, res) => {
  req.flash("success", "Successfully logged in!");
  res.redirect("/");
}

exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "Logged you out!");
  res.redirect("/");
}

exports.showForgotPasswordForm = (req, res) => {
  res.render("forgot");
}

exports.sendResetPasswordEmail  = async (req, res) => {
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
}


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


exports.showResetPasswordForm = (req, res) => {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
}

exports.resetPassword = async function(req, res) {
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
}


exports.showUserInfo = (req, res) => {
  User.findById(req.params.userid, (err, foundUser) => {
    if (err || !foundUser) {
      req.flash("error", "Something went wrong");
      res.redirect("back");
    } else {
      res.render("users/show", { user: foundUser });
    }
  });
}

exports.modifyFirstName = (req, res) => {
  User.findById(req.params.userid, async (err, foundUser) => {
    if (err || !foundUser) {
      req.flash("error", "User not found");
      res.redirect("back");
    } else {
      changeInfo(req, res);
    }
  });
}

exports.modifyLastName = (req, res) => {
  User.findById(req.params.userid, async (err, foundUser) => {
    if (err || !foundUser) {
      req.flash("error", "User not found");
      res.redirect("back");
    } else {
      changeInfo(req, res);
    }
  });
}

exports.modifyPassword = (req, res) => {
  User.findById(req.params.userid, async (err, foundUser) => {
    if (err || !foundUser) {
      req.flash("error", "User not found");
      res.redirect("back");
    } else {
      if (req.body.newpassword !== req.body.confirmnewpassword) {
        // check password matches
        req.flash("error", "New passwords do not match");
        res.redirect("back");
      } else {
        User.findById(req.params.userid, (err, user) => {
          // Check if error connecting
          if (err) {
            req.flash("error", "There is an error, please try again");
            res.redirect("back");
          } else {
            // Check if user was found in database
            if (!user) {
              // Return error, user was not found in db
              req.flash("error", "There is an error, please try again");
              res.redirect("back");
            } else {
              user.changePassword(
                req.body.oldpassword,
                req.body.newpassword,
                function (err) {
                  if (err) {
                    if (err.name === "IncorrectPasswordError") {
                      req.flash("error", "Incorrect password");
                      res.redirect("back");
                    } else {
                      req.flash("error", "There is an error, please try again");
                      res.redirect("back");
                    }
                  } else {
                    req.flash(
                      "success",
                      "Your password has been changed successfully"
                    );
                    res.redirect("back");
                  }
                }
              );
            }
          }
        });
      }
    }
  });
}


exports.modifyEmail =  (req, res) => {
  User.findById(req.params.userid, async (err, foundUser) => {
    if (err || !foundUser) {
      req.flash("error", "User not found");
      res.redirect("back");
    } else {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        req.flash(
          "error",
          "Email already in used, please choose a different one."
        );
        return res.redirect("back");
      }
      changeInfo(req, res);
    }
  });
}


function changeInfo(req, res) {
  User.findByIdAndUpdate(
    req.params.userid,
    { $set: req.body },
    (err, UpdatedUser) => {
      if (err) {
        req.flash("error", "There is an error, please try again");
        res.redirect("back");
      } else {
        req.flash("success", "Successfully changed information");
        res.redirect("back");
      }
    }
  );
}