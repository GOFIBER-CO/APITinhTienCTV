const Brand = require("../models/brand.model");
const BrandService = require("../services/brand.service");
const { dashLogger } = require("../logger");
const ResponseModel = require("../helpers/ResponseModel");

const NAME = "Brand";

const search = async (req, res) => {
  try {
    const pageSize = Number(req.query?.pageSize) || 10;
    const pageIndex = Number(req.query?.pageIndex) || 1;
    const search = req.query?.search || "";

    const data = await BrandService.search(pageSize, pageIndex, search);

    return res.status(200).json(data);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    return res.status(400).json(response);
  }
};

const getById = async (req, res) => {
  try {
    const brand = await BrandService.getById(id);

    return res.status(200).json({
      success: true,
      message: "Success",
      data: brand,
    });
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getAll = async (req, res) => {
  try {
    const brand = await BrandService.getAll();

    return res.status(200).json({
      success: true,
      message: "Success",
      data: brand,
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
    const  {name}  = req.body;
    console.log('name',req.body);
    const checkExist = await Brand.findOne({ name });

    if (checkExist)
      return res.status(400).json({ messages: `${NAME} is already exist`, success: false });

    const brand = await BrandService.create(req.body);

    return res.status(200).json({
      success: true,
      message: "Success",
      data: brand,
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
    const { name } = req.body;

    const checkIsFound = await Brand.findById(id);

    if (!checkIsFound) {
      dashLogger.error(
        `Error : Not found ${NAME}, Request : ${req.originalUrl}`
      );

      return res.status(400).json({ message: `Not found ${NAME}` });
    }

    const checkExist = await Brand.findOne({ name });

    if (checkExist && checkExist?._id?.toString() !== id)
      return res.status(400).json({ messages: `${NAME} is already exist` });

    const brand = await BrandService.update({ id, brand: req.body });

    return res.status(200).json({
      success: true,
      message: "Success",
      data: brand,
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
      Brand.findByIdAndRemove(id).exec((err, data) => {
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
  getAll,
};
