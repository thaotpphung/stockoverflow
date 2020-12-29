const express = require("express"),
  router = express.Router({ mergeParams: true }),
  passport = require("passport"),
  userController = require("../controller/user");
  
require("dotenv").config();

router.get("/register", userController.showRegisterForm);
router.post("/register", userController.createUser);
router.get("/login", userController.showLoginForm);


router.get('/login/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

router.get( '/login/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/',
        failureRedirect: '/login'
}));

router.get("/login/google", userController.getGoogleAuth);
router.get("/login/google/callback", userController.getGoogleAuthCallback);


router.post("/login", passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: true,
  successFlash:true,
  successRedirect: "/",
  successFlash: 'Successfully logged in!'
}));

router.get("/logout", userController.logout);
router.get("/forgot", userController.showForgotPasswordForm);
router.post('/forgot', userController.sendResetPasswordEmail);
router.get('/reset/:token', userController.showResetPasswordForm);
router.post('/reset/:token', userController.resetPassword);

module.exports = router;
