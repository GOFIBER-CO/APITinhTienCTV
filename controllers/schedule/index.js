const moment = require("moment");
//
const OrderPostsModel = require("./../../models/orderPost.model");
const ResponseModel = require("../../helpers/ResponseModel");
const User = require("./../../models/user.model");
const NotificationModel = require("../../models/notification.model");
const { default: mongoose } = require("mongoose");

const checkExpiredOfOrderPostWhenCtvReceived = async (req, res) => {
  let response = "";
  const today = moment(); // Lấy thời điểm hiện tại
  const currentDay = today.format("YYYY-MM-DD");
  const startDate = `${currentDay}T00:00:00Z`;
  try {
    const aa = await OrderPostsModel.find({
      $and: [
        {
          ctv: { $ne: null },
          expired: { $lt: startDate },
          statusOrderPost: { $ne: 1 },
        },
      ],
    });
    aa.map(async (item) => {
      const to = item?.ctv;
      const orderPostId = item?._id;
      const type = 2;
      const resData = new NotificationModel({ to, orderPostId, type });
      await resData.save();
    });

    await OrderPostsModel.updateMany(
      {
        $and: [
          {
            ctv: { $ne: null },
            expired: { $lt: startDate },
            statusOrderPost: { $ne: 1 },
          },
        ],
      },
      {
        $set: {
          isExpired: true,
          status: 0,
          ctv: null,
          statusOrderPost: -1,
          paymentStatus: false,
        },
      }
    );
    const isExpiredPost = await OrderPostsModel.find({ isExpired: true });
    const userIds = isExpiredPost.map((post) => post?.ctv);
    userIds?.map(async (item) => {
      await User.findByIdAndUpdate(item, {
        $inc: { star: -1, processingPost: -1 },
      }).exec();
    });
    response = new ResponseModel(200, "0h sẽ chạy hàm này", []);
    res?.status(200).json(response);
  } catch (error) {
    response = new ResponseModel(200, error.message, error);
    res?.status(500).json(response);
  }
};

const checkExpiredOfOrderPostWhenHaveNotCtvReceived = async (req, res) => {
  let response = "";
  const today = moment(); // Lấy thời điểm hiện tại
  const currentDay = today.format("YYYY-MM-DD");
  const yesterday = moment(today).subtract(1, "day"); // Lấy thời điểm trước đó 1 ngày
  const newYesterday = yesterday.format("YYYY-MM-DD");
  const startDate = `${newYesterday}T00:00:00Z`;
  const endDate = `${currentDay}T00:00:00Z`;

  try {
    await OrderPostsModel.updateMany(
      {
        $and: [
          { ctv: null },
          { status: 1 },
          { expired: { $lt: endDate, $gt: startDate } },
        ],
      },
      { $set: { isExpired: true, status: 0 } }
    );
    response = new ResponseModel(200, "1h sẽ chạy hàm này", []);
    res?.status(200).json(response);
  } catch (error) {
    response = new ResponseModel(200, error.message, error);
    res?.status(500).json(response);
  }
};
//Kiểm tra bài viết sắp hết hạn //Okee
const checkOrderPostAlmostExpired = async (req, res) => {
  const today = moment(); // Lấy thời điểm hiện tại
  const currentDay = today.format("YYYY-MM-DD");
  const startDate = `${currentDay}T00:00:00Z`;
  const endDate = `${currentDay}T23:59:59Z`;

  const listOrderPostAlmostExpired = await OrderPostsModel.find({
    expired: {
      $gt: new Date(startDate),
      $lt: new Date(endDate),
    },
    status: 1,
    ctv: { $ne: null },
  }).populate("ctv");

  listOrderPostAlmostExpired.map(async (item) => {
    const to = item?.ctv;
    const orderPostId = item?._id;
    const resData = new NotificationModel({ to, orderPostId });
    await resData.save();
  });
};

const getPagingNotifications = async (req, res) => {
  try {
    const notification = await NotificationModel.find({ to: req.user?.id })
      .sort({ updatedAt: -1 })
      .populate("to")
      .populate("orderPostId");
    const quantityNotificationNotRead = await NotificationModel.aggregate([
      {
        $group: {
          _id: "$to",
          count: {
            $sum: {
              $cond: [{ $eq: ["$isRead", false] }, 1, 0],
            },
          },
        },
      },
    ]);
    // console.log("quantityNotificationNotRead:", quantityNotificationNotRead);
    let rs = quantityNotificationNotRead?.map((item) => {
      return item?._id == req.user?.id;
    });
    return res.json({
      status: 1,
      data: notification,
      count: rs[0]?.count,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: -1, message: "ERROR_SERVER" });
  }
};
const updateStatusRead = async (req, res) => {
  try {
    const rs = await NotificationModel.updateMany(
      {
        $and: [
          { to: new mongoose.Types.ObjectId(req?.user?.id), isRead: false },
        ],
      },
      { $set: { isRead: true } }
    );
  } catch (error) {
    res.status(500).json({ error: "Lỗi server", message: error.message });
  }
};
module.exports = {
  checkExpiredOfOrderPostWhenCtvReceived,
  checkExpiredOfOrderPostWhenHaveNotCtvReceived,
  checkOrderPostAlmostExpired,
  getPagingNotifications,
  updateStatusRead,
};
