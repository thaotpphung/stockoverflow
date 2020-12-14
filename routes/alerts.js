const express = require("express"),
  router = express.Router({ mergeParams: true }),
  middleware = require("../middleware"),
  alertController = require("../controller/alert");

router.get("/", middleware.checkCorrectUser, alertController.getAlerts);
router.get("/new/:stockid", middleware.checkCorrectUser, alertController.getNewAlertForm);
router.post("/", middleware.checkCorrectUser, alertController.postAlert);
router.delete("/:stockid", middleware.checkCorrectUser, alertController.deleteAlert);

// router.get("/new", middleware.checkCorrectUser, transactionController.showNewTransactionForm);

module.exports = router;
