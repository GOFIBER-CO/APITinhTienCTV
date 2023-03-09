const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;
const orderPostsSchema = new Schema(
  {
    title: String,
    desc: String,
    keyword: [{ type: String }],
    user: { type: ObjectId, ref: "User" },
    ctv: { type: ObjectId, ref: "User", default: null },
    star: Number,
    moneyPerWord: {
      type: Number,
      default: 60000,
    },
    paymentStatus: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: null,
    },
    minWord: {
      type: Number,
    },
    note: {
      type: String,
      default: null,
    },
    statusOrderPost: {
      type: Number,
      default: -1,
    },
    expired: Date,
    isExpired: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Number,
      default: 1, //-1: chưa ai nhận || 0: đã có ctv nhận || 1: đã xong
    },
  },
  { timestamps: true }
);

const orderPosts = mongoose.model("orderPosts", orderPostsSchema);
module.exports = orderPosts;
