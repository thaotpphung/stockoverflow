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

 // if (Object.keys(req.body.user).length == 1) {
      //   foundUser.setPassword(req.body.user.password, (err, foundUser) => {
      //     if (err) {
      //       req.flash(
      //         "error",
      //         "There is an error when changing the password, please try again"
      //       );
      //       res.redirect("back");
      //     } else {
      //       foundUser.save();
      //       req.flash("success", "Successfully changed password ");
      //       res.render("users/show");
      //     }
      //   });

// USER UPDATE
router.put("/", middleware.checkCorrectUser, (req, res) => {
  User.findById(req.params.userid, (err, foundUser) => {
    if (err || !foundUser) {
      req.flash("error", "User not found");
      res.redirect("back");
    } else {
      if (!req.body.newpassword) {  // if not change password
        User.findByIdAndUpdate(req.params.userid, {$set: req.body}, (err, UpdatedUser) => {
          if (err) {
            req.flash("error", "There is an error, please try again");
            res.redirect("back");
          } else {
            req.flash("success", "Successfully changed information");
            res.redirect("back");
          }
        });
      } else { // change password
        if (req.body.newpassword !== req.body.confirmnewpassword){ // check password matches
          req.flash("error", "New passwords do not match");
          res.redirect("back"); 
        } else {
          User.findById(req.params.userid,(err, user) => {
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
                user.changePassword(req.body.oldpassword, req.body.newpassword, function(err) {
                  if(err) {
                    if(err.name === 'IncorrectPasswordError'){
                      req.flash("error", "Incorrect password");
                      res.redirect("back"); 
                    }else {
                      req.flash("error", "There is an error, please try again");
                      res.redirect("back"); 
                    }
                  } else {
                    req.flash("success", "Your password has been changed successfully");
                    res.redirect("back");
                  }
                })
              }
            }
          });  
        }
      }
    }
  });
});

// eval(require("locus"));
// username = req.body.username;
// console.log('tontai', username);
// User.findById(req.params.userid, (err, foundUser) =>  {
//   console.log("found", foundUser.username);
//   console.log('dung ko', foundUser.username === username);
//   if (username && foundUser.username === username) {
//     console.log("in here");
//     req.flash("error", "Username already exists");
//     res.redirect("back");
//   } else {
// console.log("not exist");
//   }
// });
module.exports = router;
