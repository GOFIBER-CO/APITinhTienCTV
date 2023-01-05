const jwt = require("express-jwt");
const { secret } = require("../config/auth.config");
// const db = require('_helpers/db');
const User = require("../models/user.model");
const RefreshToken = require("../models/refreshToken.model");
const Role = require("../models/role.model");

function authorize(func = "", permission = "") {
  // console.log(`vao day`);
  return [
    // authenticate JWT token and attach user to request object (req.user)
    jwt({ secret, algorithms: ["HS256"] }),

    // authorize based on user role
    async (req, res, next) => {
      // console.log(`req.user.id`,req.user.id);
      try {
        const user = await User.findById(req.user.id);

        if (!user) {
          // console.log(`vao day001`);
          // user no longer exists or role not authorized
          return res.status(401).json({ message: "Unauthorized" });
        }
        const roles = await Role.findOne({
          name: user.role,
        });
        // if (permission) {
        //   const permissionField = roles.permission.find(
        //     (item) => item.fieldName == func
        //   );
        //   if (!permissionField)
        //     return res.status(401).json({ message: "Unauthorized" });
        //   checkFlag = permissionField[permission] ? true : false;
        //   if (!checkFlag)
        //     return res.status(401).json({ message: "Unauthorized" });
        // }

        req.user.role = user.role;
        const refreshTokens = await RefreshToken.find({ user: user.id });
        req.user.ownsToken = (token) =>
          !!refreshTokens.find((x) => x.token === token);
        next();
      } catch (error) {
        console.log(error);
        return res.status(500);
      }

      // authentication and authorization successful
    },
  ];
}
module.exports = authorize;
