const moment = require("moment");
//
const OrderPostsModel = require("./../../models/orderPost.model");
const ResponseModel = require("../../helpers/ResponseModel");
const User = require("./../../models/user.model");
const NotificationModel = require("../../models/notification.model");

const checkExpiredOfOrderPostWhenCtvReceived = async (req, res) => {
  let response = "";
  const today = moment(); // Lấy thời điểm hiện tại
  const currentDay = today?.date();
  const currentMonth = today?.month();
  const currentYear = today?.year();
  const dateStr = `${currentDay}/${currentMonth}/${currentYear} 0 giờ 0 phút 0 giây`;
  const dateObj = moment(dateStr, "DD/MM/YYYY H:mm:ss");
  const isoDateStr = dateObj.toISOString();
  console.log('isoDateStr: ', isoDateStr);
  try {
    await OrderPostsModel.updateMany(
      {
        $and: [{ ctv: { $ne: null }, expired: { $lt: isoDateStr } }],
      },
      { $set: { isExpired: true, status: 0, ctv: null, statusOrderPost: -1 } }
    );
    const isExpiredPost = await OrderPostsModel.find({ isExpired: true });
    console.log("isExpiredPost: ", isExpiredPost);
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
  const date = Date.now();
  try {
    await OrderPostsModel.updateMany(
      {
        $and: [{ ctv: null }, { status: 1 }, { expired: { $lt: date } }],
      },
      { $set: { isExpired: true, status: 0 } }
    );
    response = new ResponseModel(200, "0h sẽ chạy hàm này", []);
    res?.status(200).json(response);
  } catch (error) {
    response = new ResponseModel(200, error.message, error);
    res?.status(500).json(response);
  }
};
//Kiểm tra bài viết sắp hết hạn
const checkOrderPostAlmostExpired = async (req, res) => {
  const today = moment(); // Lấy thời điểm hiện tại
  const yesterday = moment(today).subtract(1, "day"); // Lấy thời điểm trước đó 1 ngày
  console.log("yesterday: ", yesterday.date());
  // Tìm các record trong MongoDB với giá trị của trường expired trước đó 1 ngày
  const listOrderPostAlmostExpired = await OrderPostsModel.find({
    $expr: {
      $and: [
        { $eq: [{ $year: "$expired" }, yesterday.year()] },
        { $eq: [{ $month: "$expired" }, yesterday.month() + 1] },
        { $eq: [{ $dayOfMonth: "$expired" }, yesterday.date()] },
      ],
    },
    status: 1,
  });

  listOrderPostAlmostExpired.map(async (item) => {
    console.log("item: ", item);
    const to = item?.ctv;
    const orderPostId = item?._id;
    const resData = new NotificationModel({ to, orderPostId });
    await resData.save();
  });
};
module.exports = {
  checkExpiredOfOrderPostWhenCtvReceived,
  checkExpiredOfOrderPostWhenHaveNotCtvReceived,
  checkOrderPostAlmostExpired,
};
