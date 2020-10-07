const express = require("express"),
  router = express.Router({ mergeParams: true }),
  User = require("../models/user"),
  Transaction = require("../models/transaction"),
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
      res.render("transactions/index", {
        transactions: foundUser.transactions,
      });
    }
  });
});

// New transaction - form to add transaction
router.get("/stocks/:stockid/new", middleware.checkCorrectUser, (req, res) => {
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
          Transaction.findOne({stockid: stock._id}, (err, transaction) => {
            if (transaction == null) {
              res.render("transactions/new", { stock: stock, transaction: {totalquantity: 0} });
            } else {
              res.render("transactions/new", { stock: stock, transaction: transaction });
            }
          })
        }
      });
    }
  });
});

// New transaction - form to add transaction
router.get("/new", middleware.checkCorrectUser, (req, res) => {
  User.findById(req.params.userid, (err, user) => {
    if (err || !user) {
      req.flash("error", "User not found");
      res.redirect("back");
    } else {  // wrond here 
      res.render("transactions/new" , {stock: null});
    }
  });
});

//  create - add transaction to db
router.post("/", middleware.checkCorrectUser, (req, res) => {
  User.findById(req.params.userid, async (err, user) => {
    if (err || !user) {
      req.flash("error", "User not found");
      res.redirect("back");
    } else {
      var foundTransaction = await Transaction.findOne({symbol: req.body.transaction.symbol , userid : user._id});
      if (!foundTransaction) {  // if transaction of this stock has not been made b4
        var transaction =  await Transaction.create({symbol: req.body.transaction.symbol});
        transaction.userid = req.params.userid;
        transaction.name = req.body.transaction.name;
        transaction.stockid = req.body.transaction.stockid;
        await updateTransaction(transaction, req.body.transaction, req.body.transaction.type);
        user.transactions.push(transaction);
        user.save();
        req.flash("success", "Successfully added transaction");
        res.redirect("/users/" + user._id + "/transactions");
      } else {
        await updateTransaction(foundTransaction, req.body.transaction, req.body.transaction.type);
        req.flash("success", "Successfully added transaction");
        res.redirect("/users/" + user._id + "/transactions");
      }
    }
  });
});

async function updateTransaction(transaction, transactionReq, type) {
  let newHistoryEntry = {
    price: Math.round(transactionReq.price * 100), 
    time: transactionReq.time, 
    quantity: transactionReq.quantity, 
    transactiontype: type 
  };
  transaction.history.push(newHistoryEntry); 
  if (type === "Purchase") {
    transaction.totalprice += (Math.round(transactionReq.price * 100 * transactionReq.quantity)) ;
    transaction.totalquantity += parseInt(transactionReq.quantity);
  } else {
    transaction.totalprice -= (Math.round(transactionReq.price * 100 * transactionReq.quantity));
    transaction.totalquantity -= parseInt(transactionReq.quantity);
  }
  transaction.save();
  return;
}

module.exports = router;
