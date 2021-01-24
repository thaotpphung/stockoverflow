const express = require("express"),
  router = express.Router({ mergeParams: true }),
  middleware = require("../middleware"),
  transactionController = require("../controller/transaction");

router.get("/", transactionController.getTransactions);
router.get("/new/:stockid", transactionController.showNewTransactionFormByStock);
router.get("/new", transactionController.showNewTransactionForm);
router.post("/", transactionController.addTransaction);

module.exports = router;
