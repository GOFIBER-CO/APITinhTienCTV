const ResponseModel = require("../helpers/ResponseModel");
const PagedModel = require("../helpers/PagedModel");
const OrderPostsModel = require("./../models/orderPost.model");
const UserModel = require("./../models/user.model");
const Role = require("./../models/role.model");

//thêm mới
const insertNewOrderPosts = (req, res) => {
  let response = "";
  try {
    req.body.user = req?.user?.id;
    const resData = new OrderPostsModel(req.body);
    resData.save((err, data) => {
      if (err) {
        response = new ResponseModel(500, err.message, err);
        res.status(500).json(response);
      } else {
        response = new ResponseModel(200, `Thêm thành công`, data);
        res.status(200).json(response);
      }
    });
  } catch (error) {
    response = new ResponseModel(500, error.message, error);
    res.status(500).json(response);
  }
};

// lấy danh sách kết quả theo điều kiện
const getListOrderPosts = async (req, res) => {
  const pageSize = parseInt(req.query?.pageSize) || 5;
  const pageIndex = parseInt(req.query?.pageIndex) || 1;
  let response = "";
  let responsePage = "";
  let result = [];
  let resultTotal = 0;
  const userId = req?.user?.id;
  console.log(req.body);
  const objSearch = {};
  if (req.body.title) {
    objSearch.title = { $regex: ".*" + req.body.title + ".*" };
  }
  if (req.body.createdAt && req.body.createdAt.length === 2) {
    const dateFrom = new Date(req.body.createdAt[0]);
    const startDate = new Date(
      dateFrom.getFullYear(),
      dateFrom.getMonth(),
      dateFrom.getDate(),
      0,
      0,
      0
    );
    const dateTo = new Date(req.body.createdAt[1]);
    const endDate = new Date(
      dateTo.getFullYear(),
      dateTo.getMonth(),
      dateTo.getDate(),
      23,
      59,
      59
    );
    objSearch["createdAt"] = { $gte: startDate, $lte: endDate };
  }

  if (req.body.moneyPerWord) {
    objSearch.moneyPerWord = { $gte: req.body.moneyPerWord };
  }

  if (req.body.keyword) {
    objSearch.keyword = { $regex: ".*" + req.body.keyword + ".*" };
  }
  if (req.body.status) {
    objSearch.status = req.body.status;
  }
  try {
    const checkUserRole = await UserModel.findById(userId).select("role");
    if (checkUserRole) {
      if (checkUserRole?.role === "Member") {
        if (userId) {
          objSearch["user"] = userId;
        }
        result = await OrderPostsModel.find({ $and: [objSearch] })
          .skip((pageIndex - 1) * pageSize)
          .limit(pageSize);
        resultTotal = await OrderPostsModel.find({
          $and: [objSearch],
        }).countDocuments();
      } else {
        result = await OrderPostsModel.find({ $and: [objSearch] });
        resultTotal = await OrderPostsModel.find({
          $and: [objSearch],
        }).countDocuments();
      }

      responsePage = new PagedModel(
        pageIndex,
        pageSize,
        0,
        result,
        resultTotal
      );
      res.status(200).json(responsePage);
    } else {
      response = new ResponseModel(200, "Không tìm bài viết.", []);
      res.status(200).json(response);
    }
  } catch (error) {
    response = new ResponseModel(500, error.message, error);
    res.status(500).json(response);
  }
};

//Cập nhập kết quả hiện có
const updateRecord = async (req, res) => {
  // req.body.user = req?.user?.id;
  const { id } = req?.body;
  // const { title, desc, moneyPerWord, keyword } = req.body;
  console.log("id: ", id, req.body);
  let response = "";

  try {
    const checkRecordExist = await OrderPostsModel.findById(id);
    if (checkRecordExist) {
      const result = await OrderPostsModel.findByIdAndUpdate(
        id,
        // { title, desc, moneyPerWord, keyword },
        req.body,
        {
          new: true,
        }
      );
      response = new ResponseModel(200, "Cập nhập thành công.", result);
      res.status(200).json(response);
    } else {
      response = new ResponseModel(404, "Không tìm thấy bài viết.", null);
      res.status(404).json(response);
    }
  } catch (error) {
    response = new ResponseModel(500, error.message, error);
    res.status(500).json(response);
  }
};

const receivedPost = async (req, res) => {
  let response = {};
  const user = req?.user?.id;
  try {
    const userInfo = await UserModel.findOne({ _id: user, role: "CTV" });
    if (userInfo) {
      if (userInfo.star === userInfo.processingPost) {
        response = new ResponseModel(
          202,
          "Hiện tại số bài viết của bạn đã đạt giới hạn. Vui lòng hoàn thành để có thể nhận thêm",
          "Hiện tại số bài viết của bạn đã đạt giới hạn. Vui lòng hoàn thành để có thể nhận thêm"
        );
        return res.status(202).json(response);
      } else {
        const post = await OrderPostsModel.findById(req.params.id);
        if (post) {
          if (post.ctv) {
            response = new ResponseModel(
              202,
              "Bài viết đã có CTV nhận. Vui lòng reload lại trang",
              "Bài viết đã có CTV nhận. Vui lòng reload lại trang"
            );
            return res.status(202).json(response);
          } else {
            OrderPostsModel.findByIdAndUpdate(
              req.params.id,
              {
                ctv: user,
                status: 0,
              },
              {},
              (err, result) => {
                if (err) {
                  response = new ResponseModel(
                    202,
                    "Đã có lỗi. Vui lòng thử lại sau",
                    "Đã có lỗi. Vui lòng thử lại sau"
                  );
                  return res.status(202).json(response);
                } else {
                  UserModel.findByIdAndUpdate(
                    user,
                    {
                      processingPost: parseInt(userInfo?.processingPost) + 1,
                    },
                    {},
                    (errUser, resultUpdateUser) => {
                      if (errUser) {
                        response = new ResponseModel(
                          202,
                          "Đã có lỗi. Vui lòng thử lại sau",
                          "Đã có lỗi. Vui lòng thử lại sau"
                        );
                        return res.status(202).json(response);
                      } else {
                        response = new ResponseModel(
                          200,
                          "Nhận bài viết thành công!",
                          "Nhận bài viết thành công!"
                        );
                        return res.status(200).json(response);
                      }
                    }
                  );
                }
              }
            );
          }
        } else {
          response = new ResponseModel(202, "Post not found", "Post not found");
          return res.status(202).json(response);
        }
      }
    } else {
      response = new ResponseModel(202, "User not found", "User not found");
      return res.status(202).json(response);
    }
  } catch (error) {
    response = new ResponseModel(500, error.message, error);
    return res.status(500).json(response);
  }
};

// Xóa kết quả hiện có
const deleteRecord = async (req, res) => {
  const { id } = req.params;
  let response = "";

  try {
    const checkRecordExist = await OrderPostsModel.findById(id);

    if (checkRecordExist) {
      const result = await OrderPostsModel.findByIdAndDelete(id);
      if (Object.keys(result).length > 0) {
        response = new ResponseModel(200, "Xóa thành công.", result);
        res.status(200).json(response);
      }
    } else {
      response = new ResponseModel(404, "Không tìm thấy bài viết.", null);
      res.status(404).json(response);
    }
  } catch (error) {
    response = new ResponseModel(500, error.message, error);
    res.status(500).json(response);
  }
};

module.exports = {
  insertNewOrderPosts,
  getListOrderPosts,
  deleteRecord,
  updateRecord,
  receivedPost,
};
