const express = require("express"),
  router = express.Router({ mergeParams: true }),
  User = require("../models/user"),
  Stock = require("../models/stock"),
  middleware = require("../middleware");

// New alert- form to add alert
router.get("/new", middleware.checkCorrectUser, (req, res) => {
  User.findById(req.params.userid, async (err, user) => {
    if (err || !user) {
      req.flash("error", "User not found");
      res.redirect("back");
    } else {  
      const stock = await Stock.findById(req.params.stockid);
      const index = user.trackedstocks.indexOf(stock._id);
      res.render("alerts/new", { allAlerts: user.alerts, alert: user.alerts[index]});
    }
  });
});

//  create - add new alert to db
router.post("/", middleware.checkCorrectUser, (req, res) => {
  User.findById(req.params.userid, async (err, user) => {
    if (err || !user) {
      req.flash("error", "User not found");
      res.redirect("back");
    } else {
      const stock = await Stock.findById(req.params.stockid);
      const index = user.trackedstocks.indexOf(stock._id);
      user.alerts[index].alertPrice = req.body.alertPrice;
      await user.save();
      req.flash("success", "Successfully set alert");
      res.redirect("/users/" + req.params.userid + "/stocks/" + req.params.stockid);
    }
  });
});

//  destroy - delete stock alert
router.delete("/", middleware.checkCorrectUser, (req, res) => {
  User.findById(req.params.userid, async (err, user) => {
    if (err || !user) {
      req.flash("error", "User not found");
      res.redirect("back");
    } else {
      const stock = await Stock.findById(req.params.stockid);
      const index = user.trackedstocks.indexOf(stock._id);
      user.alerts[index].alertPrice = null;
      await user.save();
      req.flash("success", "Successfully deleted alert");
      res.redirect("/users/" + req.params.userid + "/stocks/" + req.params.stockid);
    }
  });
});

module.exports = router;
