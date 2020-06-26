const express = require("express"),
  router = express.Router({ mergeParams: true }),
  User = require("../models/user"),
  Purchase = require("../models/purchase"),
  Stock = require("../models/stock"),
  middleware = require("../middleware");

// index route
router.get("/", middleware.checkCorrectUser, (req, res) => {
  // get all tracked stocks from DB
  User.findById(req.params.userid)
    .populate("purchases")
    .exec((err, foundUser) => {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        res.render("purchases/index", {
          purchases: foundUser.purchases,
        });
      }
    });
});

// New purchase - form to add purchase
router.get("/:stockid/new", middleware.checkCorrectUser, (req, res) => {
  User.findById(req.params.userid, (err, user) => {
    if (err || !user) {
      req.flash("error", "User not found");
      res.redirect("back");
    } else {
      Stock.findById(req.params.stockid, (err, stock) => {
        if (err || !stock) {
          req.flash("error", "Stock not found");
          res.redirect("back");
        } else {
          res.render("purchases/new", { user: user, stock: stock });
        }
      });
    }
  });
});

//  create - add purchase to db
router.post("/:stockid/", middleware.checkCorrectUser, (req, res) => {
  User.findById(req.params.userid, (err, user) => {
    if (err || !user) {
      req.flash("error", "User not found");
      res.redirect("back");
    } else {
      Purchase.create(req.body.purchase, (err, purchase) => {
        if (err) {
          console.log(err);
        } else {
          Stock.findById(req.params.stockid, (err, stock) => {
            if (err) {
              console.log(err);
            } else {
              purchase.symbol = stock.symbol;
              purchase.name = stock.name;
              purchase.price = stock.price[0];
              purchase.time = new Date().toJSON().slice(0, 10);
              purchase.save();
              user.purchases.push(purchase);
              user.save();
              req.flash("success", "Successfully purchased stock");
              res.redirect("/purchases/" + user._id);
            }
          });
        }
      });
    }
  });
});

module.exports = router;
