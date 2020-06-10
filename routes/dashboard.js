let express = require("express"),
    router  = express.Router({mergeParams: true}),
    Stock = require("../models/stock"),
    User = require("../models/user");

// INDEX - show all tracked stocks
router.get("/", (req, res) => {
    // get all tracked stocks from DB
    User.findById(req.params.userid).populate("trackedstocks").exec((err, foundUser) => {
        if(err){
            console.log(err);
            res.redirect("/");
        } else {
            // console.log(foundUser)
            res.render("dashboard/index", {stocks: foundUser.trackedstocks});
        }
    });
});

// add tracked stocks to the shared stocks db
router.post("/",isLoggedIn, (req, res) => {
    User.findById(req.params.userid).populate("trackedstocks").exec((err, user) => {
        if(err){
            console.log(err);
            res.redirect("/");
        } else {
            Stock.find({name: req.body.stock.name}, (err, stock) =>
            {   
                if (stock.length) {  // already exists in stocks db
                    // check if exists in trackedstocks for user, if not add it
                    let counter = 0;
                    user.trackedstocks.forEach((aStock) => {
                        if (aStock.name == stock[0].name) {
                            return;
                        }
                        counter++;
                    });
                    if (counter == user.trackedstocks.length){
                        user.trackedstocks.push(stock[0]);
                        user.save();
                    }
                    res.redirect('/dashboard/' + user._id);
                } else { // not exists, add to stock db and trackedstock db
                    Stock.create(req.body.stock, (err, stock) => {
                        if(err){
                            console.log(err);
                        } else {
                            user.trackedstocks.push(stock);
                            user.save();
                            res.redirect('/dashboard/' + user._id);
                        }
                     });
                }
            });
        }
    });
 });

// NEW - show form to create new tracked stock
router.get("/new", isLoggedIn, (req, res) => {
    res.render("dashboard/new");
})

// show information of the chosen stock
router.get("/:stockid", (req, res) => {
    Stock.findById(req.params.stockid, (err, foundStock) => {
        if(err){
            console.log(err);
        } else {
            //render show template with that stock
            res.render("dashboard/show", {stock: foundStock});
        }
    });
})

//middleware
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;