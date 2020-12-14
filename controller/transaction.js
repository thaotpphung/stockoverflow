const User = require("../models/user"),
  Transaction = require("../models/transaction"),
  Stock = require("../models/stock");

exports.getTransactions = async (req, res) => {
  try {
    let allTransactions = await Transaction.find({userid: req.params.userid});
    let assets =  allTransactions.filter(transaction => transaction.isNewest == true);
    res.render("transactions/index", {
      transactions: allTransactions,
      assets: assets
    });
  } catch(err) {
    console.log(err);
    res.redirect("/");
  }
}

exports.showNewTransactionFormByStock = async (req, res) => {
  try {
    let stock = await Stock.findById(req.params.stockid);
    let transactions = await Transaction.find({userid: req.params.userid, stockid: req.params.stockid});
    if (transactions.length === 0) {
      res.render("transactions/new", { stock: stock, transaction: {totalquantity: 0} });
    } else {
      res.render("transactions/new", { stock: stock, transaction: transactions[transactions.length - 1]});
    }
  } catch (err) {
    console.log(err);
    req.flash("error", "Error occured, please try again later");
    res.redirect("back");
  }
}

exports.showNewTransactionForm = (req, res) => {
  res.render("transactions/new" , {stock: null, transaction: {totalquantity: 0}});
}

exports.addTransaction = async (req, res) => {
  try {
    let oldTransactions = await Transaction.find({symbol: req.body.transaction.symbol});
    let oldTransaction = oldTransactions[oldTransactions.length - 1];
    let newTransaction = await Transaction.create(req.body.transaction);
    let isFirstTransaction = false;
    if (oldTransactions.length === 0) { // if transaction of this stock not exists
      oldTransaction = newTransaction;
      isFirstTransaction = true;
    } 
    updateTotalByType (newTransaction, oldTransaction, req.body.transaction, isFirstTransaction);
    req.flash("success", "Successfully added transaction");
    res.redirect("/users/" + req.body.transaction.userid + "/transactions");
  } catch (err) {
    console.log(err);
  }
}

async function updateTotalByType(transaction, oldTransaction, transactionReq, isFirstTransaction) {
  const {price, quantity} = transactionReq;
  if (transactionReq.type === "Purchase") {
    transaction.totalprice = oldTransaction.totalprice + (Math.round(price * 100 * quantity)) ;
    transaction.totalquantity = oldTransaction.totalquantity +  parseInt(quantity);
  } else {
    transaction.totalprice = oldTransaction.totalprice - (Math.round(price * 100 * quantity));
    transaction.totalquantity = oldTransaction.totalquantity - parseInt(quantity);
  }
  if (!isFirstTransaction) {
    oldTransaction.isNewest = false;
    transaction.isNewest = true;
    oldTransaction.save();
  }
  transaction.price = Math.round(transactionReq.price * 100);
  transaction.save();
  return;
}