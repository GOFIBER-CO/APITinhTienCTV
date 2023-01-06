const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const domainSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      unique: true,
    },
    total: {
      type: Number,
      min: 0,
      default: 0,
    },
    brand_id: {
      type: ObjectId,
      require: true,
      ref: "Brand",
    },
  },
  { timestamps: true }
);

const Domain = mongoose.model("Domain", domainSchema);

module.exports = Domain;
