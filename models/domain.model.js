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
      
    },
    brand_id: {
      type: ObjectId,
      ref: "Brand",
    },
  },
  { timestamps: true }
);

const Domain = mongoose.model("Domain", domainSchema);

module.exports = Domain;
