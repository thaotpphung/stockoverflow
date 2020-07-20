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
    } else {  
      Stock.findById(req.params.stockid, (err, stock) => {
        if (err || !stock) {
          req.flash("error", "Stock not found");
          res.redirect("back");
        } else {
          Purchase.findOne({stockid: stock._id}, (err, purchase) => {
            if (purchase == null) {
              res.render("purchases/new", { stock: stock, purchase: {totalquantity: 0} });
            } else {
              res.render("purchases/new", { stock: stock, purchase: purchase });
            }
          })
        }
      });
    }
  });
});

// New purchase - form to add purchase
router.get("/new", middleware.checkCorrectUser, (req, res) => {
  User.findById(req.params.userid, (err, user) => {
    if (err || !user) {
      req.flash("error", "User not found");
      res.redirect("back");
    } else {  // wrond here 
      res.render("purchases/new" , {stock: null});
    }
  });
});

//  create - add purchase to db
router.post("/", middleware.checkCorrectUser, (req, res) => {
  User.findById(req.params.userid, async (err, user) => {
    if (err || !user) {
      req.flash("error", "User not found");
      res.redirect("back");
    } else {
      var foundPurchase = await Purchase.findOne({symbol: req.body.purchase.symbol , userid : user._id});
      if (!foundPurchase) {  // if purchase of this stock has not been made b4
        var purchase =  await Purchase.create({symbol: req.body.purchase.symbol});
        purchase.userid = req.params.userid;
        purchase.name = req.body.purchase.name;
        purchase.stockid = req.body.purchase.stockid;
        await updatePurchase(purchase, req.body.purchase, req.body.purchase.type);
        user.purchases.push(purchase);
        user.save();
        req.flash("success", "Successfully made transaction");
        res.redirect("/purchases/" + user._id);
      } else {
        await updatePurchase(foundPurchase, req.body.purchase, req.body.purchase.type);
        req.flash("success", "Successfully made transaction");
        res.redirect("/purchases/" + user._id);
      }
    }
  });
});

async function updatePurchase(purchase, purchaseReq, type) {
  let newHistoryEntry = {price: Math.round(purchaseReq.price * 100), time: purchaseReq.time, quantity: purchaseReq.quantity, transaction: type };
  purchase.history.push(newHistoryEntry); 
  if (type === "Purchase") {
    purchase.totalprice += (Math.round(purchaseReq.price * 100 * purchaseReq.quantity)) ;
    purchase.totalquantity += parseInt(purchaseReq.quantity);
  } else {
    console.log(purchase.totalprice);
    purchase.totalprice -= (Math.round(purchaseReq.price * 100 * purchaseReq.quantity));
    purchase.totalquantity -= parseInt(purchaseReq.quantity);
  }
  purchase.save();
  return;
}

module.exports = router;
