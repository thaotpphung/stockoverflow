var mongoose = require("mongoose");

var purchaseSchema = mongoose.Schema({
    name: String,
    // stock: {
    //     id: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "Stock"
    //     },
    //     description: String
    // },
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});

module.exports = mongoose.model("Purchase", purchaseSchema);