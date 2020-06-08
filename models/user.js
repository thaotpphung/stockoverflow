var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    trackedstocks: [
         {
            type: String
         } 
      ],
    purchases: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Purchase"
        }
     ]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);