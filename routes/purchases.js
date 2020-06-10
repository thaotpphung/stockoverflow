let express = require("express"),
    router  = express.Router({mergeParams: true}),
    User = require("../models/user"),
    Purchase = require("../models/purchase"),
    Stock = require("../models/stock");

// show purchase

// New purchase - form to add purchase
router.get("/new", isLoggedIn, (req, res) => {
    User.findById(req.params.userid, (err, user) =>{
        if(err){
            console.log(err);
        } else {
            Stock.findById(req.params.stockid, (err, stock) => {
                if(err){
                    console.log(err);
                } else {
                    res.render("purchases/new", {user: user, stock: stock});
                }
            });
        }
    })
});

//  creat - add purchase to db
router.post("/",isLoggedIn, (req, res) => {
   User.findById(req.params.userid, (err, user) => {
       if(err){
           console.log(err);
           res.redirect("/dashboard");
       } else {
            Purchase.create(req.body.purchase, (err, purchase) => {
            if(err){
                console.log(err);
            } else { 
                Stock.findById(req.params.stockid, (err, stock) => {
                    if(err){
                        console.log(err);
                    } else { 
                        purchase.name = stock.name;
                        purchase.price = stock.price;
                        purchase.user.id = req.user._id;
                        purchase.user.username = req.user.username;
                        //save purchase
                        purchase.save();
                        user.purchases.push(purchase);
                        user.save();
                        res.redirect('/portfolio/' + user._id);
                    }
                });
            }
        });
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