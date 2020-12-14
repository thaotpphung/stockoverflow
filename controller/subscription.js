const Stock = require("../models/stock"),
  Subscription = require("../models/subscription")
  stockController = require("../controller/stock"),
  mongoose = require("mongoose");
require("dotenv").config();

// get all subscription of user - DONE
exports.getSubscriptions = async (req, res) => {
  try {
    let subscriptions = await Subscription.find({userid: req.params.userid}).populate("stock").exec();
    res.render("subscriptions/index", { subscriptions : subscriptions});
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
}

// delete subsciption
exports.deleteSubscription = async (req, res) => {
  try {
    Subscription.deleteOne(
      {
        userid: req.params.userid, 
        stock: ObjectId('', req.params.stockid, '')
      }
    );
    req.flash("success", "Stock deleted");
    res.redirect("/users/" + req.params.userid + "/subscriptions");
  } catch (err) {
    console.log(err);
  }
}

// add a substription
exports.addSubscription = async (req, res) => {
  try {
    let stock = await Stock.findOne({symbol: req.body.stock.symbol});
    if (stock == null) {
      stock = await stockController.addStockHelper(req.body, req.body.stock.symbol);
    } 
    Subscription.create ({
      userid: req.params.userid, 
      stock: stock._id
    });
    req.flash("success", "Successfully made action!");
    res.redirect("/users/" + req.params.userid + "/subscriptions");
  } catch (err) {
    console.log(err);
  }
};



