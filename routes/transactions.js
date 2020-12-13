const express = require("express"),
  router = express.Router({ mergeParams: true }),
  middleware = require("../middleware"),
  transactionController = require("../controller/transaction");

router.get("/", middleware.checkCorrectUser, transactionController.getTransactions);
router.get("/new/:stocksymbol", middleware.checkCorrectUser, transactionController.showNewTransactionFormByStock);
router.get("/new", middleware.checkCorrectUser, transactionController.showNewTransactionForm);
router.post("/", middleware.checkCorrectUser, transactionController.postTransaction);

module.exports = router;
