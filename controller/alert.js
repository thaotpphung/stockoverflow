const User = require("../models/user"),
  Stock = require("../models/stock"),
  Alert = require("../models/alert");


exports.getAlerts = (req, res) => {
  User.findById(req.params.userid)
    .populate("alerts")
    .populate("trackedstocks")
    .exec((err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        res.render("alerts/index", {alerts: user.alerts});
      }
    });
}

exports.getNewAlertForm = (req, res) => {
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
          Alert.findOne({stockid: stock._id}, (err, alert) => {
            if (alert == null) {
              res.render("alerts/new", { stock: stock, alert: {alertPrice: 0.0} });
            } else {
              res.render("alerts/new", { stock: stock, alert: alert });
            }
          })
        }
      });
    }
  });
}

exports.postAlert =  (req, res) => {
  console.log("here");
  User.findById(req.params.userid, async (err, user) => {
    if (err || !user) {
      req.flash("error", "User not found");
      res.redirect("back");
    } else {
      let foundAlert = await Alert.findOne({symbol: req.body.alert.symbol, userid : user._id});
      if (!foundAlert) {  // if alert of this stock has not been made b4
        let alert =  await Alert.create({symbol: req.body.alert.symbol});
        alert.userid = req.params.userid;
        alert.stockid = req.body.alert.stockid;
        alert.name = req.body.alert.name;
        alert.alertPrice = req.body.alert.price;
        console.log("new alert object", alert);
        console.log("-----------")
        alert.save();
        user.alerts.push(alert);
        user.save();
        req.flash("success", "Successfully added alert");
        res.redirect("/users/" + user._id + "/alerts");
        console.log("done")
      } else {
        foundAlert.alertPrice = req.body.alert.price;
        foundAlert.save();
        req.flash("success", "Successfully added alert");
        res.redirect("/users/" + user._id + "/alerts");
      }
    }
  });
}

exports.deleteAlert = (req, res) => {
  User.findById(req.params.userid, async (err, user) => {
    if (err || !user) {
      req.flash("error", "User not found");
      res.redirect("back");
    } else {
      Alert.deleteOne({stockid: req.params.stockid}, (err) => {
        if (err) {
          console.log(err);
          req.flash("error", "Error when deleting alert, please try again");
          res.redirect("back");
        } else {
          req.flash("success", "Successfully deleted alert");
          res.redirect("/users/" + req.params.userid + "/alerts");
        }
      })
    }
  });
}
