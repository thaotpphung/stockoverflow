const express = require("express"),
  router = express.Router({ mergeParams: true }),
  User = require("../models/user"),
  middleware = require("../middleware");

router.get("/", middleware.isLoggedIn, (req, res) => {
  User.findById(req.params.userid, (err, foundUser) => {
    if (err || !foundUser) {
      req.flash("error", "Something went wrong");
      res.redirect("back");
    } else {
      res.render("users/show", { user: foundUser });
    }
  });
});

// USER EDIT ROUTE
router.get("/edit", middleware.checkCorrectUser, (req, res) => {
  User.findById(req.params.userid, (err, foundUser) => {
    if (err || !foundUser) {
      res.redirect("back");
    } else {
      res.render("users/edit");
    }
  });
});

// USER UPDATE
router.put("/", middleware.checkCorrectUser, (req, res) => {
  User.findById(req.params.userid, (err, foundUser) => {
    if (err || !foundUser) {
      req.flash("error", "User not found");
      res.redirect("back");
    } else {
      if (Object.keys(req.body.user).length == 1) {
        foundUser.setPassword(req.body.user.password, (err, foundUser) => {
          if (err) {
            req.flash(
              "error",
              "There is an error when changing the password, please try again"
            );
            res.redirect("back");
          } else {
            foundUser.save();
            req.flash("success", "Successfully changed password ");
            res.render("users/show");
          }
        });
      } else {
        User.findByIdAndUpdate(
          req.params.userid,
          req.body.user,
          (err, UpdatedUser) => {
            if (err) {
              req.flash("error", "User not found");
              res.redirect("back");
            } else {
              req.flash("success", "Successfully changed information");
              res.render("users/show");
            }
          }
        );
      }
    }
  });
});

module.exports = router;
