var mongoose = require("mongoose");

var transactionSchema = mongoose.Schema({
  userid: String,
  symbol: String,
  name: String,
  history: [  // transaction history of this stock
    {
      price: Number,
      time: String,
      quantity: Number,
      transactiontype: String
    }
  ],
  totalprice: {type: Number, default: 0},
  totalquantity: {type: Number, default: 0},
});

transactionSchema.statics.getAllByUserId = function (userid, cb) {
  console.log("userid in schema", userid);
  return this.find({userid: new RegExp(userid, 'i')}, cb);
}

module.exports = mongoose.model("Transaction", transactionSchema);
