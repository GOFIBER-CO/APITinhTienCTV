const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
  },
  // permission: [
  //     {
  //         fieldName: String,
  //         add: {
  //             type: Boolean,
  //             default: false,
  //         },
  //         edit: {
  //             type: Boolean,
  //             default: false,
  //         },
  //         delete: {
  //             type: Boolean,
  //             default: false,
  //         }
  //     }
  // ]
});

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;
