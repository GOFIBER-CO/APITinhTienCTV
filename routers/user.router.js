const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");
const Role = require("../helpers/role");
const {
  authenticate,
  authenticateSchema,
  refreshToken,
  revokeToken,
  revokeTokenSchema,
  getById,
  getAll,
  getRefreshTokens,
  removeUser,
  searchUser,
  editUser,
  editProfile,
  editAvatar,
  deleteAvatar,
  signup,
  createUserPermission,
  getUserPermissionById,
  editUserPermission,
  removeUserPermission,
  getPaging,
} = require("../controllers/user.controller");
const permissionFunction = require("../helpers/permissionFunction");
const permissionFieldName = require("../helpers/permissionFieldName");

/**
 * @swagger
 *  components:
 *   schemas:
 *     Users:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "5eb12e197e06a76ccdefc121"
 *         firstName:
 *           type: string
 *           example: "Jason"
 *         lastName:
 *           type: string
 *           example: "Watmore"
 *         username:
 *           type: string
 *           example: "jason"
 *         role:
 *           type: string
 *           example: "Admin"
 *         jwtToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWIxMmUxOTdlMDZhNzZjY2RlZmMxMjEiLCJpZCI6IjVlYjEyZTE5N2UwNmE3NmNjZGVmYzEyMSIsImlhdCI6MTU4ODc1ODE1N30.xR9H0STbFOpSkuGA9jHNZOJ6eS7umHHqKRhI807YT1Y"
 *         createdAt:
 *           type: date
 *           description: thời gian tạo
 *         updatedAt:
 *           type: date
 *           description: thời gian update
 *   responses:
 *     UnauthorizedError:
 *       description: Access token is missing or invalid, or the user does not have access to perform the action
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Unauthorized"
 *     NotFoundError:
 *       description: Not Found
 *       content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                 message:
 *                   type: string
 *                   example: "Not Found"
 */

/**
 * @swagger
 *  tags:
 *    name: Users
 *    description: Users
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Returns all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: [Admin]
 *     responses:
 *      200:
 *         description: the list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Users'
 *
 *      404:
 *        $ref: '#/components/responses/NotFoundError'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *
 */
// router.get("/users", authorize(), getAll);
router.get("/users", getAll);

/**
 * @swagger
 * /api/users/{id}:
 *   parameters:
 *    - in: path
 *      name: name
 *      description: query
 *      required: true
 *      example: "5eb12e197e06a76ccdefc121"
 *      schema:
 *        type: string
 *   get:
 *     summary: Returns a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *      200:
 *         description: the list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Users'
 *
 *      404:
 *        $ref: '#/components/responses/NotFoundError'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *
 */
router.get("/users/:id"
// , authorize()
, getById);

/**
 * @swagger
 * /api/users/{id}/refresh-tokens:
 *   parameters:
 *    - in: path
 *      name: id
 *      description: refresh token User
 *      required: true
 *      example: "5eb12e197e06a76ccdefc121"
 *      schema:
 *        type: string
 *   get:
 *     summary: Returns a token
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *      200:
 *         description: token
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                type: object
 *                properties:
 *                  token:
 *                    type: string
 *                    example: "79ea9a5e825da7c27d30839c89295071842f2a44b22e917aaf795126f4486509d8511c6fdedb6f1e"
 *                  expires:
 *                    type: string
 *                    example: "2020-06-24T03:29:13.871Z"
 *                  created:
 *                    type: string
 *                    example: "2020-06-17T03:29:13.871Z"
 *                  createdByIp:
 *                    type: string
 *                    example: "127.0.0.1"
 *                  isExpired:
 *                    type: boolean
 *                    example: false
 *                  isActive:
 *                    type: boolean
 *                    example: true
 *                  revoked:
 *                    type: string
 *                    example: "2020-06-17T03:29:13.871Z"
 *                  revokedByIp:
 *                    type: string
 *                    example: "127.0.0.1"
 *                  replacedByToken:
 *                    type: string
 *                    example: "a01d3818db64961742f249beeded65739e9c3d1019570ea48ea820d274eac607043a6cbefd23c297"
 *
 *      404:
 *        $ref: '#/components/responses/NotFoundError'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *
 */

router.get("/users/:id/refresh-tokens", authorize(), getRefreshTokens);

/**
 * @swagger
 * /api/users/user/search:
 *   parameters:
 *    - in: path
 *      name: name
 *      description: query
 *      required: true
 *      example: "5eb12e197e06a76ccdefc121"
 *      schema:
 *        type: string
 *   get:
 *     summary: Returns a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *      200:
 *         description: the list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Users'
 *
 *      404:
 *        $ref: '#/components/responses/NotFoundError'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *
 */

router.get("/users/user/search"
// , authorize()
, searchUser);

/**
 * @swagger
 * /api/users/authenticate:
 *   post:
 *      summary: Authenticate user credentials and return a JWT token and a cookie with a refresh token
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                  example: "jason"
 *                password:
 *                  type: string
 *                  example: "pass123"
 *              required:
 *                - username
 *                - password
 *      responses:
 *       200:
 *         description: User details, a JWT access token and a refresh token cookie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/Users'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *        $ref: '#/components/responses/NotFoundError'
 */
router.post("/user/login", authenticateSchema, authenticate);

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *      summary: Signin user
 *      tags: [Users]
 *      security:
 *       - bearerAuth: [Admin]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                  example: "jason"
 *                password:
 *                  type: string
 *                  example: "pass123"
 *                firstName:
 *                  type: string
 *                  example: "david"
 *                lastName:
 *                  type: string
 *                  example: "beckham"
 *                role:
 *                  type: string
 *                  example: "Admin"
 *              required:
 *                - username
 *                - password
 *                - role
 *      responses:
 *       200:
 *         description: Signin user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/Users'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *        $ref: '#/components/responses/NotFoundError'
 */
router.post("/users/signup", signup);

/**
 * @swagger
 * /api/users/refresh-token:
 *   post:
 *     summary: Use a refresh token to generate a new JWT token and a new refresh token
 *     description: The refresh token is sent and returned via cookies.
 *     operationId: refreshToken
 *     tags: [Users]
 *     parameters:
 *       - in: cookie
 *         name: refreshToken
 *         description: The `refreshToken` cookie
 *         schema:
 *           type: string
 *           example: 51872eca5efedcf424db4cf5afd16a9d00ad25b743a034c9c221afc85d18dcd5e4ad6e3f08607550
 *     responses:
 *       "200":
 *         description: User details, a JWT access token and a new refresh token cookie
 *         headers:
 *           Set-Cookie:
 *             description: "`refreshToken`"
 *             schema:
 *               type: string
 *               example: refreshToken=51872eca5efedcf424db4cf5afd16a9d00ad25b743a034c9c221afc85d18dcd5e4ad6e3f08607550; Path=/; Expires=Tue, 16 Jun 2020 09:14:17 GMT; HttpOnly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "5eb12e197e06a76ccdefc121"
 *                 firstName:
 *                   type: string
 *                   example: "Jason"
 *                 lastName:
 *                   type: string
 *                   example: "Watmore"
 *                 username:
 *                   type: string
 *                   example: "jason"
 *                 role:
 *                   type: string
 *                   example: "Admin"
 *                 jwtToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWIxMmUxOTdlMDZhNzZjY2RlZmMxMjEiLCJpZCI6IjVlYjEyZTE5N2UwNmE3NmNjZGVmYzEyMSIsImlhdCI6MTU4ODc1ODE1N30.xR9H0STbFOpSkuGA9jHNZOJ6eS7umHHqKRhI807YT1Y"
 *       "400":
 *         description: The refresh token is invalid, revoked or expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 */
router.post("/users/refresh-token", refreshToken);

/**
 * @swagger
 * /api/users/revoke-token:
 *  post:
 *    summary: Revoke a refresh token
 *    description: Admin users can revoke the tokens of any user, regular users can only revoke their own tokens.
 *    operationId: revokeToken
 *    tags: [Users]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: cookie
 *        name: refreshToken
 *        description: The refresh token can be sent in a cookie or the post body, if both are sent the token in the body is used.
 *        schema:
 *          type: string
 *          example: 51872eca5efedcf424db4cf5afd16a9d00ad25b743a034c9c221afc85d18dcd5e4ad6e3f08607550
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              token:
 *                type: string
 *                example: "51872eca5efedcf424db4cf5afd16a9d00ad25b743a034c9c221afc85d18dcd5e4ad6e3f08607550"
 *    responses:
 *      "200":
 *        description: The refresh token was successfully revoked
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Token revoked"
 *      "400":
 *        description: The refresh token is invalid
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Invalid token"
 *      "401":
 *        $ref: "#/components/responses/UnauthorizedError"
 */
router.post("/users/revoke-token", authorize(), revokeTokenSchema, revokeToken);
/**
 * @swagger
 * /api/users/{id}:
 *   parameters:
 *    - in: path
 *      name: id
 *      description: user id
 *      required: true
 *      example: "5eb12e197e06a76ccdefc121"
 *      schema:
 *        type: string
 *   put:
 *      summary: edit user
 *      tags: [Users]
 *      security:
 *       - bearerAuth: [Admin]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                  example: "jason"
 *                firstName:
 *                  type: string
 *                  example: "david"
 *                lastName:
 *                  type: string
 *                  example: "beckham"
 *                role:
 *                  type: string
 *                  example: "Admin"
 *              required:
 *                - username
 *                - role
 *      responses:
 *       200:
 *         description: Edit user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/Users'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *        $ref: '#/components/responses/NotFoundError'
 */
router.put(
  "/users/:id",
  // authorize(permissionFunction.USER, permissionFieldName.EDIT),
  editUser
);
router.put(
  "/upload/:id",
  authorize(permissionFunction.USER, permissionFieldName.EDIT),
  editAvatar
);
router.delete(
  "/upload/:id",
  authorize(permissionFunction.USER, permissionFieldName.DELETE),
  deleteAvatar
);
router.patch("/user/editAvatar", authorize(), editAvatar);
router.patch("/user/editProfile"
// , authorize()
, editProfile);

/**
 * @swagger
 * /api/users/delete/{id}:
 *  parameters:
 *    - in: path
 *      name: id
 *      description: Remove user id
 *      required: true
 *      example: "5eb12e197e06a76ccdefc121"
 *      schema:
 *        type: string
 *  delete:
 *    summary: Remove a single user by id
 *    description: Admin users can access any user record, regular users are restricted to their own user record.
 *    operationId: removeUser
 *    tags: [Users]
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      "200":
 *        description: Delete successfuly
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                isSuccess:
 *                  type: boolean
 *                  example: true
 *                message:
 *                  type: string
 *                  example: "Delete Successfuly"
 *      "404":
 *        $ref: "#/components/responses/NotFoundError"
 *      "401":
 *        $ref: "#/components/responses/UnauthorizedError"
 *
 */
router.delete("/users/delete/:id", removeUser);

router.post("/users/user/permission", authorize(), createUserPermission);
router.get("/users/user/permission/:id", authorize(), getUserPermissionById);
router.put(
  "/users/user/permission/:id",
  authorize(Role.Admin),
  editUserPermission
);
router.delete(
  "/users/user/permission/delete/:id",
  authorize(Role.Admin),
  removeUserPermission
);

module.exports = router;
