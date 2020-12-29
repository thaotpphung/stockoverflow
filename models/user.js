var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
  username: {type: String, unique: true},
  password: String,
  firstname: String,
  lastname: String,
  email: {type: String, unique: true, required: true},
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  googleid: String
}); 

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
