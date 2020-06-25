var mongoose = require("mongoose");

var purchaseSchema = mongoose.Schema({
  symbol: String,
  name: String,
  price: Number,
  time: String,
  quantity: Number,
});

module.exports = mongoose.model("Purchase", purchaseSchema);
