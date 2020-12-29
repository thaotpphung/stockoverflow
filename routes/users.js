const express = require("express"),
  router = express.Router({ mergeParams: true }),
  middleware = require("../middleware"),
  userController = require("../controller/user");
  
router.get("/", middleware.isLoggedIn, userController.showUserInfo);
router.put("/edit/basic", middleware.checkCorrectUser, userController.modifyBasicInfo);
router.put("/edit/password", middleware.checkCorrectUser, userController.modifyPassword);
router.put("/edit/email", middleware.checkCorrectUser, userController.modifyEmail);
router.put("/edit/username", middleware.checkCorrectUser, userController.modifyUsername);

module.exports = router;
