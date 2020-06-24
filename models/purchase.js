var mongoose = require("mongoose");

var purchaseSchema = mongoose.Schema({
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  symbol: String,
  name: String,
  price: Number,
  time: String,
  quantity: Number,
});

module.exports = mongoose.model("Purchase", purchaseSchema);
