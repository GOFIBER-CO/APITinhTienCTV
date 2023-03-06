const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    fullName: {
      type: String,
    },
    stk: {
      type: String,
    },
    bank_name: {
      type: String,
      require: true,
      default: "",
    },
    status: {
      type: Number,
    },
    processingPost: {
      type: Number,
      default: 0,
    },
    star: {
      type: Number,
      default: 5,
    },
    role: {
      type: String,
      require: true,
    },
    avatar: {
      type: String,
    },
    team: {
      type: mongoose.Types.ObjectId,
      ref: "Team",
    },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
    delete ret.passwordHash;
  },
});

module.exports = mongoose.model("User", userSchema);
