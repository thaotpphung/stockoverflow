var express = require("express");
var router  = express.Router({mergeParams: true});
var User = require("../models/user");
var Purchase = require("../models/purchase");

// New purchase - form to add purchase
router.get("/new", isLoggedIn, function(req, res){
    // find campground by id
    console.log("In new purchase router: ", req.params.id);
    User.findById(req.params.id, function(err, user ){
        if(err){
            console.log(err);
        } else {
            res.render("purchases/new", {user: user});
        }
    })
});

//  creat - add purchase to db
router.post("/",isLoggedIn,function(req, res){
   //lookup user using ID
   User.findById(req.params.id, function(err, user){
       if(err){
           console.log(err);
           res.redirect("/dashboard");
       } else {
        Purchase.create(req.body.purchase, function(err, purchase){
           if(err){
               console.log(err);
           } else {
               //add username and id to purchase
               purchase.user.id = req.user._id;
               purchase.user.description = req.user.description;
               //save purchase
               purchase.save();
               user.purchases.push(purchase);
               user.save();
               console.log(purchase);
               res.redirect('/dashboard/' + user.username);
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