var mongoose = require("mongoose");

var purchaseSchema = mongoose.Schema({
  userid: String,
  symbol: String,
  name: String,
  stockid: String,
  history: [
    {
      price: Number,
      time: String,
      quantity: Number
    }
  ],
  totalprice: {type: Number, default: 0},
  totalquantity: {type: Number, default: 0}
});

module.exports = mongoose.model("Purchase", purchaseSchema);
