// Danh sách màn hình CTV có quyền
const permissionScreenCTV = ["/postOfYou", "/postsNotReceived"];

//Danh sách màn hình cho admin
const permissionScreenAdmin = [
  "/dashboard-analytics",
  "/team-analytics",
  "/domain-analytics",
  "/ctv-analytics",
  "/brand",
  "/teams",
  "/domains",
  "/payment",
  "/postsLink",
  "/users",
  "/postsOrder",
  "/postsNotReceived",
  "/postOfYou",
];

//Danh sách màn hình cho member
const permissionScreenMember = [
  "/dashboard-analytics",
  "/team-analytics",
  "/domain-analytics",
  "/ctv-analytics",
  "/payment",
  "/postsLink",
  "/postsOrder",
  "/postsNotReceived",
  "/postOfYou",
];
module.exports = {
  permissionScreenCTV,
  permissionScreenAdmin,
  permissionScreenMember,
};
