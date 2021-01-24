const express = require("express"),
  router = express.Router({ mergeParams: true }),
  middleware = require("../middleware"),
  alertController = require("../controller/alert");

router.get("/", alertController.getAlerts);
router.get("/new/:stockid", alertController.getNewAlertForm);
router.post("/",alertController.postAlert);
router.delete("/:stockid", alertController.deleteAlert);

// router.get("/new", middleware.checkCorrectUser, transactionController.showNewTransactionForm);

module.exports = router;
