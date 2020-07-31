const express = require("express"),
  router = express.Router({ mergeParams: true }),
  User = require("../models/user"),
  Stock = require("../models/stock"),
  middleware = require("../middleware");

// index route
router.get("/", middleware.checkCorrectUser, (req, res) => {
  // get all tracked stocks from DB
  User.findById(req.params.userid).populate("transactions").exec((err, foundUser) => {
    if (err) {
      console.log(err);
      res.redirect("/");
    } else {
      res.render("alerts/index", {
        alerts: foundUser.alerts,
      });
    }
  });
});

// New alert- form to add alert
router.get("/:stocksymbol/new", middleware.checkCorrectUser, (req, res) => {
  User.findById(req.params.userid, async (err, user) => {
    if (err || !user) {
      req.flash("error", "User not found");
      res.redirect("back");
    } else {  
      const stock = await Stock.findOne({symbol: req.params.stocksymbol})
      const index = user.trackedstocks.indexOf(stock._id);
      res.render("alerts/new", { allAlerts: user.alerts, alert: user.alerts[index]});
    }
  });
});

//  create - add new alert to db
router.post("/:stocksymbol", middleware.checkCorrectUser, (req, res) => {
  User.findById(req.params.userid, async (err, user) => {
    if (err || !user) {
      req.flash("error", "User not found");
      res.redirect("back");
    } else {
      const stock = await Stock.findOne({symbol: req.params.stocksymbol})
      const index = user.trackedstocks.indexOf(stock._id);
      user.alerts[index].alertPrice = req.body.alertPrice;
      await user.save();
      req.flash("success", "Successfully set alert");
      res.redirect("/stocks/" + req.params.userid + "/" + stock._id);
    }
  });
});

//  destroy - delete stock alert
router.delete("/:stocksymbol", middleware.checkCorrectUser, (req, res) => {
  User.findById(req.params.userid, async (err, user) => {
    if (err || !user) {
      req.flash("error", "User not found");
      res.redirect("back");
    } else {
      const stock = await Stock.findOne({symbol: req.params.stocksymbol})
      const index = user.trackedstocks.indexOf(stock._id);
      user.alerts[index].alertPrice = null;
      await user.save();
      req.flash("success", "Successfully deleted alert");
      res.redirect("/stocks/" + req.params.userid + "/" + stock._id);
    }
  });
});

module.exports = router;
