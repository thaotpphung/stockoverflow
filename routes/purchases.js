const express = require("express"),
  router = express.Router({ mergeParams: true }),
  User = require("../models/user"),
  Purchase = require("../models/purchase"),
  Stock = require("../models/stock"),
  middleware = require("../middleware");

// index route
router.get("/", middleware.checkCorrectUser, (req, res) => {
  // get all tracked stocks from DB
  User.findById(req.params.userid).populate("purchases").exec((err, foundUser) => {
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
    } else {  // wrond here 
      Stock.findById(req.params.stockid, (err, stock) => {
        if (err || !stock) {
          req.flash("error", "Stock not found");
          res.redirect("back");
        } else {
          res.render("purchases/new", { stock: stock });
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
      Stock.findById(req.params.stockid, (err, stock) => { 
        Purchase.findOne({symbol: stock.symbol , userid : user._id}, (err, foundPurchase) => {
          console.log(foundPurchase);
          if (!foundPurchase) {  // if purchase of this stock has not been made b4
            console.log("not found purchase");
            Purchase.create({symbol: stock.symbol}, (err, purchase) => {
              if (err) {
                console.log(err);
              } else {
                purchase.name = stock.name;
                var history = {price: stock.price[0], time: new Date().toJSON().slice(0, 10), quantity: req.body.purchase.quantity };
                purchase.history.push(history); 
                purchase.totalprice += (stock.price[0]);
                purchase.totalquantity += parseInt(req.body.purchase.quantity);
                purchase.userid = req.params.userid;
                purchase.save();
                user.purchases.push(purchase);
                user.save();
                req.flash("success", "Successfully purchased stock");
                res.redirect("/purchases/" + user._id);
              }
            });
          } else {
            console.log("found purchase");
            var history = {price: stock.price[0], time: new Date().toJSON().slice(0, 10), quantity: req.body.purchase.quantity };
            foundPurchase.totalprice += (stock.price[0]);
            foundPurchase.totalquantity += parseInt(req.body.purchase.quantity);
            foundPurchase.history.push(history); 
            foundPurchase.save();
            req.flash("success", "Successfully purchased stock");
            res.redirect("/purchases/" + user._id);
          }
        });
      });
    }
  });
});

module.exports = router;
