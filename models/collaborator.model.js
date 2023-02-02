const mongoose = require("mongoose");
const { OWNER_CONFIRM } = require("../helpers");
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
    // tên ngân hàng
    bank_name: {
      type: String,
      require: true,
      default: "",
    },
    // tên chủ thẻ
    account_holder: {
      type: String,
      require: true,
    },
    category: {
      type: String,
    },
    // số lượng từ
    number_words: {
      type: Number,
      min: 0,
      default: 0,
    },
    // tổng tiền (số lượng từ * số tiền mỗi từ)
    total: {
      type: Number,
      min: 0,
      default: 0,
    },
    owner_confirm: {
      type: Number,
      default: OWNER_CONFIRM.PENDING,
      enum: [1, 2],
    },  
    domain_id: [
      {
        type: ObjectId,
        require: true,
        ref: "Domain",
      },
    ],
    note: {
      type: String,
      default: "",
    },
    link_management_ids: [
      {
        type: ObjectId,
        ref: "LinkManagement",
      },
    ],
    // brand_id: {
    //   type: ObjectId,
    //   // require: true,
    //   ref: "Brand",
    // },
  },
  {
    timestamps: true,
  }
);

const Collaborator = mongoose.model("Collaborator", CollaboratorSchema);

module.exports = Collaborator;
