const User = require("../models/user"),
  Transaction = require("../models/transaction"),
  Stock = require("../models/stock");

exports.getTransactions = async (req, res) => {
  try {
    let transactions = await Transaction.find({userid: req.params.userid});
    res.render("transactions/index", {
      transactions: transactions,
    });
  } catch(err) {
    console.log(err);
    res.redirect("/");
  }
}

exports.showNewTransactionFormByStock = async (req, res) => {
  try {
    let stock = await Stock.findOne({symbol: req.params.stocksymbol});
    let transaction = await Transaction.findOne({symbol: req.params.stocksymbol});
    if (transaction == null) {
      res.render("transactions/new", { stock: stock, transaction: {totalquantity: 0} });
    } else {
      res.render("transactions/new", { stock: stock, transaction: transaction });
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
    let transaction = await Transaction.findOne(
      {
        symbol: req.body.transaction.symbol, 
        userid : req.body.transaction.userid
      }
    );
    if (!transaction) {  // if transaction of this stock has not been made b4
      let transaction =  await Transaction.create(req.body.transaction); // create new transaction
      await updateTransaction(transaction, req.body.transaction);
    } else {
      await updateTransaction(transaction, req.body.transaction);
    }
    req.flash("success", "Successfully added transaction");
    res.redirect("/users/" + req.body.transaction.userid + "/transactions");
  } catch (err) {
    console.log(err);
    req.flash("error", "Error occured, please try again later");
    res.redirect("back");
  }
}

async function updateTransaction(transaction, transactionReq) {
  let {price, time, quantity, type} = transactionReq;
  price = Math.round(price * 100);
  let newHistoryEntry = {price, time, quantity, type};
  console.log('new', newHistoryEntry);
  transaction.history.push(newHistoryEntry); 
  if (type === "Purchase") {
    transaction.totalprice += (Math.round(price * quantity)) ;
    transaction.totalquantity += parseInt(quantity);
  } else {
    transaction.totalprice -= (Math.round(price * quantity));
    transaction.totalquantity -= parseInt(quantity);
  }
  transaction.save();
  return;
}