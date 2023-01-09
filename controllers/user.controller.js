const userService = require("../services/user.service");
const Joi = require("joi");
const validateRequest = require("../middleware/validate-request");
const Role = require("../helpers/role");
async function signup(req, res) {
  const { username, password, firstName, lastName, role, domain } = req.body;
  var user = await userService.createUser({
    username,
    password,
    firstName,
    lastName,
    role,
    domain,
  });
  if (!user) {
    return res.status(400).json({ message: "User already exists" });
  } else {
    return res.json(user);
  }
}
async function editUser(req, res) {
  const id = req.params?.id;
  const { username, firstName, lastName, role } = req.body;
  var user = await userService.editUser({
    id,
    username,
    firstName,
    lastName,
    role,
  });
  if (!user) {
    return res
      .status(400)
      .json({ message: `Can't Update user or role does not exist` });
  } else {
    return res.json(user);
  }
}

async function editProfile(req, res) {
  const { firstname, lastname, username, id } = req.body;
  var user = await userService.editProfile(username, firstname, lastname, id);
  if (!user) {
    return res
      .status(400)
      .json({ message: `Can't Update user or role does not exist` });
  } else {
    return res.status(200).json({ user, message: "Update successfull" });
  }
}

async function editAvatar(req, res) {
  try {
    const result = await userService.editAvatar(req.body.id, req.body.image);
    if (result) {
      return res.status(200).json({ status: "success", message: "Success" });
    } else {
      return res.status(400).json({ message: "Can't not update" });
    }
  } catch (error) {
    return res.status(500);
  }
}

async function deleteAvatar(req, res) {
  const id = req.params?.id;
  var user = await userService.deleteAvatar({ id });
  if (!user) {
    return res
      .status(400)
      .json({ message: `Can't Update user or role does not exist` });
  } else {
    console.log("error");
  }
}

async function searchUser(req, res) {
  const search = req.query?.q;
  var query = await userService.search(search);
  return res.json(query);
}

async function removeUser(req, res) {
  const id = req.params?.id;
  var user = await userService.removeUser(id);
  if (user) {
    return res.status(200).json({
      isSuccess: true,
      message: "Successfully",
    });
  } else {
    return res.status(400).json({
      isSuccess: false,
      message: "User not found",
    });
  }
}

function authenticateSchema(req, res, next) {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function authenticate(req, res, next) {
  const { username, password } = req.body;
  const ipAddress = req.ip;
  userService
    .authenticate({ username, password, ipAddress })
    .then(({ refreshToken, status, message, ...user }) => {
      setTokenCookie(res, refreshToken);

      const data = {
        status,
        data: status === 1 ? user : message,
      };

      res.json(data);
    })
    .catch((err) => console.log(err))
    .catch(next);
}

function refreshToken(req, res, next) {
  const token = req.cookies.refreshToken;
  const ipAddress = req.ip;
  userService
    .refreshToken({ token, ipAddress })
    .then(({ refreshToken, ...user }) => {
      setTokenCookie(res, refreshToken);
      res.json(user);
    })
    .catch(next);
}

function revokeTokenSchema(req, res, next) {
  const schema = Joi.object({
    token: Joi.string().empty(""),
  });
  validateRequest(req, next, schema);
}

function revokeToken(req, res, next) {
  // accept token from request body or cookie
  const token = req.body?.token || req.cookies.refreshToken;
  const ipAddress = req.ip;

  if (!token) return res.status(400).json({ message: "Token is required" });

  // users can revoke their own tokens and admins can revoke any tokens
  if (!req.user.ownsToken(token) && req.user.role.name !== Role.Admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  userService
    .revokeToken({ token, ipAddress })
    .then(() => res.json({ message: "Token revoked" }))
    .catch(next);
}

function getAll(req, res, next) {
  try {
    userService
      .getAll()
      .then((users) => res.json(users))
      .catch((error) => res.json(error));
  } catch (err) {
    res.status(500).json(error);
  }
}

function getById(req, res, next) {
  console.log(req.user);
  // regular users can get their own record and admins can get any record
  if (req.params.id !== req.user.id && req.user.role.name !== Role.Admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  userService
    .getById(req.params.id)
    .then((user) => (user ? res.json(user) : res.sendStatus(404)))
    .catch(next);
}

function getRefreshTokens(req, res, next) {
  console.log(req.user.role, "aaaaa");
  // users can get their own refresh tokens and admins can get any user's refresh tokens
  if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  userService
    .getRefreshTokens(req.params.id)
    .then((tokens) => (tokens ? res.json(tokens) : res.sendStatus(404)))
    .catch(next);
}

// helper functions

function setTokenCookie(res, token) {
  // create http only cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: false,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };

  res.cookie("refreshToken", token, cookieOptions);
}

async function createUserPermission(req, res) {
  const { userId, fieldName, view, edit, del } = req.body;
  var userPermission = await userService.createUserPermission({
    userId,
    fieldName,
    view,
    edit,
    del,
  });
  if (!userPermission) {
    return res.status(400).json({ message: "UserPermission already exists" });
  } else {
    return res.json(userPermission);
  }
}

function getUserPermissionById(req, res, next) {
  // regular users can get their own record and admins can get any record
  if (req.params.id !== req.user.id && req.user.role.name !== Role.Admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  userService
    .getUserPermissionById(req.params.id)
    .then((userPermissions) =>
      userPermissions ? res.json(userPermissions) : res.sendStatus(404)
    )
    .catch(next);
}

async function editUserPermission(req, res) {
  const id = req.params?.id;
  const { username, firstName, lastName, role } = req.body;
  var user = await userService.editUser({
    id,
    username,
    firstName,
    lastName,
    role,
  });
  if (!user) {
    return res
      .status(400)
      .json({ message: `Can't Update user or role does not exist` });
  } else {
    return res.json(user);
  }
}

async function removeUserPermission(req, res) {
  const id = req.params?.id;
  var userPermission = await userService.removeUserPermission(id);
  if (userPermission) {
    return res.status(200).json({
      isSuccess: true,
      message: "Successfully",
    });
  } else {
    return res.status(400).json({
      isSuccess: false,
      message: "User not found",
    });
  }
}

module.exports = {
  authenticate,
  authenticateSchema,
  refreshToken,
  revokeToken,
  revokeTokenSchema,
  getById,
  getAll,
  getRefreshTokens,
  signup,
  removeUser,
  searchUser,
  editUser,
  editProfile,
  editAvatar,
  deleteAvatar,
  createUserPermission,
  getUserPermissionById,
  editUserPermission,
  removeUserPermission,
};
