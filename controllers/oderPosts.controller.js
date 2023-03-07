const ResponseModel = require("../helpers/ResponseModel");
const PagedModel = require("../helpers/PagedModel");
const OrderPostsModel = require("./../models/orderPost.model");
const UserModel = require("./../models/user.model");
const Role = require("./../models/role.model");

//thêm mới
const insertNewOrderPosts = (req, res) => {
  let response = "";
  try {
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
  const userId = req?.query?.userId;
  console.log("userId: ", userId);
  const objSearch = {};

  if (req.query.status) {
    objSearch["status"] = req.query.status;
  }

  try {
    const checkUserRole = await UserModel.findById(userId).select("role");
    console.log("checkUserRole: ", checkUserRole);
    if (checkUserRole) {
      if (checkUserRole?.role === "Member") {
        objSearch["user"] = userId;
        result = await OrderPostsModel.find(objSearch)
          .skip((pageIndex - 1) * pageSize)
          .limit(pageSize);
        resultTotal = await OrderPostsModel.find(objSearch).countDocuments();
      } else {
        result = await OrderPostsModel.find(objSearch);
        resultTotal = await OrderPostsModel.find(objSearch).countDocuments();
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
  const { id } = req.params;
  let response = "";

  try {
    const checkRecordExist = await OrderPostsModel.findById(id);
    if (checkRecordExist) {
      const result = await OrderPostsModel.findOneAndUpdate(id, req.body, {
        new: true,
      });
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
};
