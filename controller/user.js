const passport = require("passport"),
  User = require("../models/user"),
  crypto = require("crypto");

/**
 * Show user information by user's ID
 * @param {} req
 * @param {*} res
 */
exports.showUserInfo = (req, res) => {
  User.findById(req.params.userid, (err, foundUser) => {
    if (err || !foundUser) {
      req.flash("error", "Something went wrong");
      res.redirect("back");
    } else {
      res.render("users/show", { user: foundUser });
    }
  });
};

/**
 * Modify user's basic information such as first name and last name
 * @param {} req
 * @param {*} res
 */
exports.modifyBasicInfo = (req, res) => {
  User.findById(req.params.userid, async (err, foundUser) => {
    if (err || !foundUser) {
      req.flash("error", "User not found");
      res.redirect("back");
    } else {
      changeInfo(req, res);
    }
  });
};

/**
 * Modify user's password
 * @param {} req
 * @param {*} res
 */
exports.modifyPassword = async (req, res) => {
  if (req.body.newpassword !== req.body.confirmnewpassword) {
    // check password matches
    req.flash("error", "New passwords do not match");
    res.redirect("back");
  } else {
    let user = await User.findById(req.params.userid);
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
          req.flash("success", "Your password has been changed successfully");
          res.redirect("back");
        }
      }
    );
  }
};

/**
 * Modify user's email
 * @param {*} req 
 * @param {*} res 
 */
exports.modifyEmail = (req, res) => {
  User.findOne({ email: req.body.email }, (err, foundUser) => {
    if (foundUser) {
      req.flash(
        "error",
        `The email $req.body.email$ is already in used, please choose a different one.`
      );
      return res.redirect("back");
    }
    changeInfo(req, res);
  });
};

/**
 * Modify username
 * @param {} req 
 * @param {*} res 
 */
exports.modifyUsername = (req, res) => {
  User.findOne({ username: req.body.username }, (err, foundUser) => {
    if (foundUser) {
      req.flash(
        "error",
        `The sername $req.body.username$ is already in used, please choose a different one.`
      );
      return res.redirect("back");
    }
    changeInfo(req, res);
  });
};

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

exports.showRegisterForm = (req, res) => {
  res.render("register");
};

exports.createUser = async (req, res) => {
  try {
      // check unique valid user name here
    if (req.body.password == req.body.confirm) {
      let foundUser = await User.find({ $or: [{ username: req.body.username }, { email: req.body.email }] });
      if (foundUser.length == 0) {
        let newUser = new User(req.body);
        // encode the password
        let user = await User.register(newUser, req.body.password);
        passport.authenticate("local")(req, res, () => {
          req.flash(
            "success",
            "Welcome to Stockoverflow " + user.firstname
          );
          res.redirect("/");
        });
      } else {
        req.flash(
          "error",
          "A user with the given username or email already exists, please choose a different one."
        );
        res.redirect("back");
      }
    } else {
      req.flash("error", "Password doesn't match");
      res.redirect("back");
    }
  } catch (err) {
    req.flash("error", );
    res.redirect("back");
  }
};

exports.showLoginForm = (req, res) => {
  res.render("login");
};

exports.login = (req, res) => {
  req.flash("success", "Successfully logged in!");
  res.redirect("/");
};

exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "Logged you out!");
  res.redirect("/");
};

exports.showForgotPasswordForm = (req, res) => {
  res.render("forgot");
};

exports.sendResetPasswordEmail = async (req, res) => {
  try {
    // generate reset token to send.
    let reset_token = await generateResetToken();
    // find the specified user by email.
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash("error", "No account with that email address.");
      throw "user not found.";
    }
    user.resetPasswordToken = reset_token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour in ms
    // passport local mongoose allows for promises inherently.
    await user.save();
    // send email here
    const message =
      "You are receiving this because you (or someone else) have requested the reset of the password linked to your StockOverflow account. " +
      "Please click on the following link, or paste this into your browser to complete the process." +
      "\n\n" +
      "http://" +
      req.headers.host +
      "/reset/" +
      reset_token +
      "\n\n" +
      "If you did not request this, please ignore this email and your password will remain unchanged.";
    const subject = "StackOverflow Password Reset";
    const sendError = sendEmail(user.email, message, subject);

    if (!sendError) {
      req.flash(
        "success",
        "An email has been sent to " +
          user.email +
          " with further instructions."
      );
      res.redirect("/forgot");
    } else {
      console.log(sendError);
      req.flash(
        "error",
        "Sorry, something went wrong, please contact admin@website.com"
      );
      res.redirect("back");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/forgot");
  }
};

function sendEmail(email, message, subject) {
  var nodemailer = require("nodemailer");
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD,
    },
  });
  var mailOptions = {
    from: "stockoverflow.ad@gmail.com",
    to: email,
    subject: "StackOverflow Password Reset",
    text: message,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return error;
    } else {
      console.log("Email sent: " + info.response);
      return null;
    }
  });
}

/**
 * create a Promise wrapper around crypo.randombytes since it doesn't support Promise by default
 */
var generateResetToken = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(20, (err, buf) => {
      if (err) reject(err);
      else {
        let reset_token = buf.toString("hex");
        resolve(reset_token);
      }
    });
  });
};

/**
 * Show reset password form
 * @param {*} req 
 * @param {*} res 
 */
exports.showResetPasswordForm = (req, res) => {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    },
    function (err, user) {
      if (!user) {
        req.flash("error", "Password reset token is invalid or has expired.");
        return res.redirect("/forgot");
      }
      res.render("reset", { token: req.params.token });
    }
  );
};

exports.resetPassword = async function (req, res) {
  try {
    let user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("back");
    }
    if (req.body.password === req.body.confirm) {
      await user.setPassword(req.body.password);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      // send email here
      const message =
        "Hello,\n\n" +
        "This is a confirmation that the password for your account " +
        user.email +
        " has just been changed.\n";
      const subject = "Successfully Changed Password";
      const sendError = sendEmail(user.email, message, subject);

      if (!sendError) {
        req.login(user, function (err) {
          if (err) {
            req.flash(
              "error",
              "Sorry, something went wrong, please contact admin@website.com"
            );
            return res.redirect("back");
          } else {
            req.flash("success", "Success! Your password has been changed.");
            return res.redirect("/");
          }
        });
      } else {
        req.flash(
          "error",
          "Sorry, something went wrong, please contact admin@website.com"
        );
        return res.redirect("back");
      }
    } else {
      req.flash("error", "Passwords do not match.");
      return res.redirect("back");
    }
  } catch (error) {
    console.log(error);
    req.flash(
      "error",
      "Sorry, something went wrong, please contact stockoverflow.stockapp@gmail.com"
    );
    return res.redirect("/forgot");
  }
};
