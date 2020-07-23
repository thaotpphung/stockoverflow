var mongoose = require("mongoose");

var transactionSchema = mongoose.Schema({
  userid: String,
  symbol: String,
  name: String,
  stockid: String,
  history: [
    {
      price: Number,
      time: String,
      quantity: Number,
      transactiontype: String
    }
  ],
  totalprice: {type: Number, default: 0},
  totalquantity: {type: Number, default: 0}
});

module.exports = mongoose.model("Transaction", transactionSchema);
