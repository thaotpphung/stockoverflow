var User = require("../models/user");

// all the middleare goes here
var middlewareObj = {};

middlewareObj.checkCorrectUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    User.findById(req.params.userid)
      .populate("trackedstocks")
      .exec((err, foundUser) => {
        if (err || !foundUser) {
          req.flash("error", "User not found");
          res.redirect("back");
        } else {
          if (foundUser._id.equals(req.user.id)) {
            next();
          } else {
            req.flash("error", "You don't have permission to do that");
            res.redirect("back");
          }
        }
      });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
};

middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be logged in to do that");
  res.redirect("/login");
};

module.exports = middlewareObj;
