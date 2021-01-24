var mongoose = require("mongoose");

var subscriptionSchema = mongoose.Schema({
  userid: String,
  stockid: String,
  stock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stock"
  },
});

module.exports = mongoose.model("Subscription", subscriptionSchema);




