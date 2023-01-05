const mongoose = require("mongoose");
const { Schema } = mongoose;
let FPsSchema = new Schema(
  {
    visitorId: {
      type: String,
      require: true,
    },
    ip: {
      type: String,
      require: true,
    },
    browserName: {
      type: String,
      require: true,
    },
    ipLocation: {
      type: Object,
      require: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("FPs", FPsSchema);
