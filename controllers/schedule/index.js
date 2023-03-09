const OrderPostsModel = require("./../../models/orderPost.model");
const ResponseModel = require("../../helpers/ResponseModel");
const User = require("./../../models/user.model");

const checkExpiredOfOrderPostWhenCtvReceived = async (req, res) => {
  let response = "";
  const date = Date.now();
  try {
    await OrderPostsModel.updateMany(
      {
        $and: [{ ctv: { $ne: null } }, { expired: { $lt: date } }],
      },
      { $set: { isExpired: true, status: 0, ctv: null, statusOrderPost: -1 } }
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

module.exports = {
  checkExpiredOfOrderPostWhenCtvReceived,
  checkExpiredOfOrderPostWhenHaveNotCtvReceived,
};
