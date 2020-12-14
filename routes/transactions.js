const express = require("express"),
  router = express.Router({ mergeParams: true }),
  middleware = require("../middleware"),
  transactionController = require("../controller/transaction");

router.get("/", middleware.checkCorrectUser, transactionController.getTransactions);
router.get("/new/:stockid", middleware.checkCorrectUser, transactionController.showNewTransactionFormByStock);
router.get("/new", middleware.checkCorrectUser, transactionController.showNewTransactionForm);
router.post("/", middleware.checkCorrectUser, transactionController.addTransaction);

module.exports = router;
