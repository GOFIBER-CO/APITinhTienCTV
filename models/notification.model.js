const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    from: { type: String, default: "Hệ thống" },
    to: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
    orderPostId: {
      type: mongoose.Types.ObjectId,
      ref: "orderPosts",
      default: null,
    },
    message: {
      type: String,
      default: null,
    },
    isRead: { type: Boolean, default: false },
    type: {
      type: Number,
      default: 1, //1:sắp  hết hạn, 2 quá hạn.
    },
  },
  { timestamps: true }
);

const notification = mongoose.model("Notifications", notificationSchema);
module.exports = notification;
