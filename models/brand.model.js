const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      unique: true,
    },
    total: {
      type: Number,
      // require: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;
