const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Role = require("../models/role.model");

const auth = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  const data = jwt.verify(token, process.env.JWT_SECRET);
  if (token) {
    try {
      const user = await User.findOne({ _id: data.id, "tokens.token": token });
      if (!user) {
        throw new Error();
      }
      console.log(user, "aasdasdasdasdasdas");
      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      res.status(401).send({ error: "Not authorized to access this resource" });
    }
  } else {
    return res.status(403).send({ message: "No token provided!" });
  }

  // if (!token) {
  //     return res.status(403).send({ message: "No token provided!" });
  // }
  // jwt.verify(token, process.env.SECRET, (err, decoded) => {
  //     if (err) {
  //         return res.status(401).send({ message: "Unauthorized!" });
  //     }
  //     req.userId = decoded.id;
  //     next();
  // });
};
const isAdmin = async (req, res, next) => {
  User.findById(req.user._id).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    Role.find(
      {
        _id: { $in: user.roles },
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name == "Admin") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Admin Role!" });
        return;
      }
    );
  });
};
const isCollaborators = async (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    Role.find(
      {
        _id: { $in: user.roles },
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name == "Collaborators") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Collaborators Role!" });
        return;
      }
    );
  });
};
const isEditor = async (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    Role.find(
      {
        _id: { $in: user.roles },
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name == "Editor") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Editor Role!" });
        return;
      }
    );
  });
};
const checkRolesExisted = async (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      var roles = await Role.find({ name: req.body.roles[i] });
      if (!roles) {
        res.status(400).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist`,
        });
        return;
      }
    }
  }
  next();
};

const authJwt = {
  auth,
  isAdmin,
  isCollaborators,
  isEditor,
  checkRolesExisted,
};
module.exports = authJwt;
