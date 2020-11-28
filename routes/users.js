const express = require("express"),
  router = express.Router({ mergeParams: true }),
  middleware = require("../middleware"),
  userController = require("../controller/user");
  
router.get("/", middleware.isLoggedIn, userController.showUserInfo);
router.put("/modifyFirstName", middleware.checkCorrectUser, userController.modifyFirstName);
router.put("/modifyLastName", middleware.checkCorrectUser, userController.modifyLastName);
router.put("/modifyPassWord", middleware.checkCorrectUser, userController.modifyPassword);
router.put("/modifyEmail", middleware.checkCorrectUser, userController.modifyEmail);

module.exports = router;
