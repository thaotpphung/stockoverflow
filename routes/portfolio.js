const express = require("express"),
  router = express.Router({ mergeParams: true }),
  User = require("../models/user"),
  middleware = require("../middleware");

// INDEX - show all purchases
router.get("/", middleware.checkCorrectUser, (req, res) => {
  // get all tracked stocks from DB
  User.findById(req.params.userid)
    .populate("purchases")
    .exec((err, foundUser) => {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        res.render("portfolio/index", {
          purchases: foundUser.purchases,
        });
      }
    });
});

module.exports = router;
