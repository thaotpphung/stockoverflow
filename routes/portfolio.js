var express = require("express");
var router  = express.Router({mergeParams: true});
var Stock = require("../models/stock");
var User = require("../models/user");

// INDEX - show all purchases
router.get("/", isLoggedIn, function (req, res){
    // get all tracked stocks from DB
    User.findById(req.params.userid).populate("purchases").exec(function(err, foundUser){
        if(err){
            console.log(err);
            res.redirect("/");
        } else {
            // console.log(foundUser)
            res.render("portfolio/index", {purchases: foundUser.purchases});
        }
    });
});

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;