const express = require("express"),
  router = express.Router({ mergeParams: true }),
  subscriptionController = require("../controller/subscription"),
  middleware = require("../middleware");

router.get("/", middleware.checkCorrectUser, subscriptionController.getSubscriptions);
router.delete("/:subscriptionid", middleware.checkCorrectUser, subscriptionController.deleteSubscription);
router.post("/", middleware.checkCorrectUser, subscriptionController.addSubscription);

module.exports = router;
