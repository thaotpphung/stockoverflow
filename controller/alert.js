const User = require("../models/user"),
  Stock = require("../models/stock"),
  Alert = require("../models/alert");

exports.getAlerts = async (req, res) => {
  try {
    let alerts = await Alert.find({userid: req.params.userid});
    res.render("alerts/index", {alerts: alerts});
  } catch (err) {
    console.log(err);
  }
}

exports.getNewAlertForm = async (req, res) => {
  try {
    let stock = await Stock.findById(req.params.stockid);
    let alert = await Alert.findOne({userid: req.params.userid, stockid: req.params.stockid});
    if (alert == null) {
      res.render("alerts/new", { stock: stock, alert: {alertPrice: 0.0} });
    } else {
      res.render("alerts/new", { stock: stock, alert: alert });
    }
  } catch (err) {
    console.log(err);
    req.flash("error", "Error occured, please try again later");
    res.redirect("back");
  }
}

exports.postAlert =  async (req, res) => {
  try {
    let alert = await Alert.findOne({symbol: req.body.alert.symbol, userid : req.params.userid});
    if (!alert) {  // if alert of this stock has not been made b4
      let alert =  await Alert.create(req.body.alert);
      req.flash("success", "Successfully added alert");
      res.redirect("/users/" + req.params.userid + "/alerts");
    } else {
      alert.alertPrice = req.body.alert.alertPrice;
      alert.save();
      req.flash("success", "Successfully added alert");
      res.redirect("/users/" + req.params.userid + "/alerts");
    }
  } catch (err) {
    console.log(err);
    req.flash("error", "Error occured, please try again later");
    res.redirect("back");
  }
}

exports.deleteAlert = async (req, res) => {
  try {
    await Alert.deleteOne({userid: req.params.userid},{stockid: req.params.stockid});
    req.flash("success", "Successfully deleted alert");
    res.redirect("/users/" + req.params.userid + "/alerts");
  } catch (err) {
    console.log(err);
    req.flash("error", "Error occured, please try again later");
    res.redirect("back");
  }
}
