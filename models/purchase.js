var mongoose = require("mongoose");

var purchaseSchema = mongoose.Schema({
    name: String,
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    quantity: Number,
    price: String,
    // time: Date
});

module.exports = mongoose.model("Purchase", purchaseSchema);