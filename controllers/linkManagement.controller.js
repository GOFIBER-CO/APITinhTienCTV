const LinkManagement = require("../models/linkManagement.model");
const LinkManagementService = require("../services/linkManagement.service");
const { dashLogger } = require("../logger");
const ResponseModel = require("../helpers/ResponseModel");
const googleDoc = require("../helpers/google.doc");
const parseNumberOfword = require("../helpers/parseNumberOfWord");
const NAME = "Link Management";

const search = async (req, res) => {
  try {
    const pageSize = Number(req.query?.pageSize) || 10;
    const pageIndex = Number(req.query?.pageIndex) || 1;
    const search = req.query?.search || "";

    const data = await LinkManagementService.search(
      pageSize,
      pageIndex,
      search
    );

    return res.status(200).json(data);
  } catch (error) {
    let response = new ResponseModel(400, error.message, error);
    res.status(400).json(response);
  }
};

const getById = async (req, res) => {
  try {
    const linkManagement = await LinkManagementService.getById(id);

    return res.status(200).json({
      success: true,
      message: "Success",
      data: linkManagement,
    });
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error.message,
    });
  }
};

const create = async (req, res) => {
  try {
    const { link_post } = req.body;

    if (!link_post)
      return res.status(400).json({ messages: `Link post not exist` });

    const doc = await googleDoc.printDoc(link_post);

    const { title, body, inlineObjects } = doc?.data;

    let number_word = 0;
    let number_image = 0;

    // const linkManagement = await LinkManagementService.create(req.body);

    return res.status(200).json({
      success: true,
      message: "Success",
      data: result?.data,
    });
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);

    return res.status(400).json({
      message: error?.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const checkIsFound = await LinkManagement.findById(id);

    if (!checkIsFound) {
      dashLogger.error(
        `Error : Not found ${NAME}, Request : ${req.originalUrl}`
      );

      return res.status(400).json({ message: `Not found ${NAME}` });
    }

    const checkExist = await LinkManagement.findOne({ title });

    if (checkExist && checkExist?._id?.toString() !== id)
      return res.status(400).json({ messages: `${NAME} is already exist` });

    const linkManagement = await LinkManagementService.update({
      id,
      linkManagement: req.body,
    });

    return res.status(200).json({
      success: true,
      message: "Success",
      data: linkManagement,
    });
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error?.message,
    });
  }
};

const remove = (req, res) => {
  const { id } = req.params;
  try {
    if (id) {
      LinkManagement.findByIdAndRemove(id).exec((err, data) => {
        if (err) {
          dashLogger.error(`Error : ${err}, Request : ${req.originalUrl}`);
          return res.status(400).json({
            message: err.message,
          });
        }
        res.json({
          success: true,
          message: `${NAME} is deleted successfully`,
        });
      });
    } else {
      dashLogger.error(
        `Error : 'Not found ${NAME}', Request : ${req.originalUrl}`
      );
      res.status(400).json({
        message: `Not found ${NAME}`,
      });
    }
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  search,
  create,
  remove,
  update,
  getById,
};
