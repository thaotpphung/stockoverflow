let express = require("express"),
    router  = express.Router({mergeParams: true}),
    Stock = require("../models/stock"),
    User = require("../models/user");

// INDEX - show all purchases
router.get("/", isLoggedIn, (req, res) => {
    // get all tracked stocks from DB
    User.findById(req.params.userid).populate("purchases").exec((err, foundUser) => {
        if(err){
            console.log(err);
            res.redirect("/");
        } else {
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