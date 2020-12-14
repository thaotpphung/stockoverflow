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
    let stock = await Stock.findOne({stockid: req.params.stockid});
    let alert = await Alert.findOne({stockid: req.params.stockid});
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
    let alert = await Alert.findOne({symbol: req.body.alert.symbol, userid : user._id});
    if (!alert) {  // if alert of this stock has not been made b4
      let alert =  await Alert.create(req.body.alert);
      console.log("new alert object", alert);
      console.log("-----------")
      req.flash("success", "Successfully added alert");
      res.redirect("/users/" + user._id + "/alerts");
    } else {
      alert.alertPrice = req.body.alert.price;
      alert.save();
      req.flash("success", "Successfully added alert");
      res.redirect("/users/" + user._id + "/alerts");
    }
  } catch (err) {
    console.log(err);
    req.flash("error", "Error occured, please try again later");
    res.redirect("back");
  }
}

exports.deleteAlert = (req, res) => {
  try {
    Alert.deleteOne({stockid: req.params.stockid});
    req.flash("success", "Successfully deleted alert");
    res.redirect("/users/" + req.params.userid + "/alerts");
  } catch (err) {
    console.log(err);
    req.flash("error", "Error occured, please try again later");
    res.redirect("back");
  }
}
