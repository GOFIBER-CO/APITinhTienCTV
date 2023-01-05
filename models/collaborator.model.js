const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const CollaboratorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    // số tài khoản
    stk: {
      type: String,
      require: true,
    },
    // tên chủ thẻ
    account_holder: {
      type: String,
      require: true,
    },
    category: {
      type: String,
      require: true,
    },
    // số lượng bài viết n từ
    quantity500: {
      type: Number,
      min: 0,
      default: 0,
    },
    quantity700: {
      type: Number,
      min: 0,
      default: 0,
    },
    quantity1000: {
      type: Number,
      min: 0,
      default: 0,
    },
    // số tiền cho mỗi bài viết n từ
    money500: {
      type: Number,
      min: 0,
      default: 0,
    },
    money700: {
      type: Number,
      min: 0,
      default: 0,
    },
    money1000: {
      type: Number,
      default: 0,
    },
    // tổng tiền (số bài viết n từ * số tiền mỗi bài viết n từ)
    total500: {
      type: Number,
      min: 0,
      default: 0,
    },
    total700: {
      type: Number,
      min: 0,
      default: 0,
    },
    total1000: {
      type: Number,
      min: 0,
      default: 0,
    },
    domain_id: {
      type: ObjectId,
      require: true,
      ref: "Domain",
    },
    link_management_ids: [
      {
        type: ObjectId,
        ref: "LinkManagement",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Collaborator = mongoose.model("Collaborator", CollaboratorSchema);

module.exports = Collaborator;
