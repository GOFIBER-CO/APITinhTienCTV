const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      unique: true,
    },
    brand: {
      type: mongoose.Types.ObjectId,
      ref: "Brand",
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

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;
