const express = require("express"),
  router = express.Router({ mergeParams: true }),
  subscriptionController = require("../controller/subscription"),
  middleware = require("../middleware");

router.get("/", subscriptionController.getSubscriptions);
router.delete("/:subscriptionid",  subscriptionController.deleteSubscription);
router.post("/", subscriptionController.addSubscription);

module.exports = router;
