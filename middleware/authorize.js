const jwt = require("express-jwt");
const { secret } = require("../config/auth.config");
// const db = require('_helpers/db');
const User = require("../models/user.model");
const RefreshToken = require("../models/refreshToken.model");
const Role = require("../models/role.model");

function authorize(func = "", permission = "") {
  return [
    jwt({ secret, algorithms: ["HS256"] }),
    async (req, res, next) => {
      try {
        const user = await User.findById(req.user.id);

        if (!user) {
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
        console.log(user, "asdaaasdasdasdasdss");
        // req.user.role = user.role;
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
