const express = require("express");
const {
  getPagingNotifications,
  updateStatusRead,
} = require("../controllers/schedule");
const router = express.Router();
const authorize = require("../middleware/authorize");

router.get("/notifications/getPaging", authorize(), getPagingNotifications);
router.patch(
  "/notifications/update-read-status",
  authorize(),
  updateStatusRead
);
module.exports = router;
