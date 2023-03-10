const express = require("express");
const router = express.Router();
const orderPostController = require("./../controllers/oderPosts.controller");
const authorize = require("../middleware/authorize");

router.post(
  "/order-post/insert",
  authorize(),
  orderPostController.insertNewOrderPosts
);
router.post(
  "/order-post/list",
  authorize(),
  orderPostController.getListOrderPosts
);
router.put(
  "/order-post/received-post/:id",
  authorize(),
  orderPostController.receivedPost
);
router.delete(
  "/order-post/delete/:id",
  authorize(),
  orderPostController.deleteRecord
);
router.get(
  "/order-post/refund/:id",
  authorize(),
  orderPostController.refundPost
);
router.patch(
  "/order-post/update/banking",
  authorize(),
  orderPostController.updateStatusBanking
);
router.patch(
  "/order-post/update",
  authorize(),
  orderPostController.updateRecord
);

module.exports = router;
