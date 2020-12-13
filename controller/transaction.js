const User = require("../models/user"),
  Transaction = require("../models/transaction"),
  Stock = require("../models/stock");

exports.getTransactions = async (req, res) => {
  try {
    let allTransactions = await Transaction.find({userid: req.params.userid});
    // console.log("all transaciton", allTransactions);
    let assets =  allTransactions.filter(transaction => transaction.isNewest == true);
    console.log("assets", assets);
    // eval(require("locus"));

    res.render("transactions/index", {
      transactions: allTransactions,
    });
  } catch(err) {
    console.log(err);
    res.redirect("/");
  }
}

exports.showNewTransactionFormByStock = async (req, res) => {
  try {
    let stock = await Stock.findOne({symbol: req.params.stocksymbol});
    let transactions = await Transaction.find({symbol: req.params.stocksymbol});
    console.log('newest ', transactions[transactions.length - 1]);
    if (transactions.length === 0) {
      res.render("transactions/new", { stock: stock, transaction: {totalquantity: 0} });
    } else {
      res.render("transactions/new", { stock: stock, transaction: transactions[transactions.length - 1] });
    }
  } catch (err) {
    console.log(err);
    req.flash("error", "Error occured, please try again later");
    res.redirect("back");
  }
}

exports.showNewTransactionForm = (req, res) => {
  res.render("transactions/new" , {stock: null});
}

exports.postTransaction = async (req, res) => {
  try {
    let oldTransactions = await Transaction.find({symbol: req.body.transaction.symbol});
    let transaction = await Transaction.create(req.body.transaction);
    if (oldTransactions.length === 0) { // if transaction of this stock already exists
      updateTotalByType (transaction, transaction, req.body.transaction, true);
    } else {  // not exist before 
      console.log("exists");
      updateTotalByType (transaction, oldTransactions[oldTransactions.length - 1], req.body.transaction, false);
    }
    req.flash("success", "Successfully added transaction");
    res.redirect("/users/" + req.body.transaction.userid + "/transactions");
  } catch (err) {
    console.log(err);
  }
}

async function updateTotalByType(transaction, oldTransaction, transactionReq, isFirst) {
  if (transactionReq.type === "Purchase") {
    transaction.totalprice = oldTransaction.totalprice + (Math.round(transactionReq.price * 100 * transactionReq.quantity)) ;
    transaction.totalquantity = oldTransaction.totalquantity +  parseInt(transactionReq.quantity);
  } else {
    transaction.totalprice = oldTransaction.totalprice - (Math.round(transactionReq.price * 100 * transactionReq.quantity));
    transaction.totalquantity = oldTransaction.totalquantity - parseInt(transactionReq.quantity);
  }
  if (!isFirst) {
    oldTransaction.isNewest = false;
    transaction.isNewest = true;
    oldTransaction.save();
  }
  transaction.save();
  return;
}