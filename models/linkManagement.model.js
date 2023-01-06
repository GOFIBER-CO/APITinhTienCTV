const mongoose = require("mongoose");
const { LINK_STATUS } = require("../helpers");

const linkManagementSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
      require: true,
    },
    title: {
      type: String,
      require: true,
    },
    link_post: {
      type: String,
      require: true,
    },
    link_posted: {
      type: String,
    },
    number_words: {
      type: Number,
      require: true,
      min: 0,
    },
    number_images: {
      type: Number,
      require: true,
      min: 0,
    },
    status: {
      type: Number,
      default: LINK_STATUS.PENDING,
    },
    category: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

const LinkManagement = mongoose.model("LinkManagement", linkManagementSchema);

module.exports = LinkManagement;
