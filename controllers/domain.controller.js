const Domain = require("../models/domain.model");
const DomainService = require("../services/domain.service");
const LinkManagement = require("../models/linkManagement.model");
const { dashLogger } = require("../logger");
const ResponseModel = require("../helpers/ResponseModel");

const NAME = "Domain";

const search = async (req, res) => {
  try {
    const pageSize = Number(req.query?.pageSize) || 10;
    const pageIndex = Number(req.query?.pageIndex) || 1;
    const search = req.query?.search || "";

    const data = await DomainService.search(pageSize, pageIndex, search);

    return res.status(200).json(data);
  } catch (error) {
    let response = new ResponseModel(400, error.message, error);
    res.status(400).json(response);
  }
};

const getById = async (req, res) => {
  try {
    const domain = await DomainService.getById(id);

    return res.status(200).json({
      success: true,
      message: "Success",
      data: domain,
    });
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error.message,
    });
  }
};

const create = async (req, res) => {
  // console.log(req.body,'đsss');
  try {
    const { name } = req.body.name;

    const checkExist = await Domain.findOne({ name });

    if (checkExist)
      return res.status(400).json({ messages: `${NAME} is already exist` });

    const domain = await DomainService.create(req.body);

    return res.status(200).json({
      success: true,
      message: "Success",
      data: domain,
    });
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    console.log(error.message, "ddd");
    return res.status(400).json({
      message: error?.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const checkIsFound = await Domain.findById(id);

    if (!checkIsFound) {
      dashLogger.error(
        `Error : Not found ${NAME}, Request : ${req.originalUrl}`
      );

      return res.status(400).json({ message: `Not found ${NAME}` });
    }

    const checkExist = await Domain.findOne({ name });

    if (checkExist && checkExist?._id?.toString() !== id)
      return res.status(400).json({ messages: `${NAME} is already exist` });

    const domain = await DomainService.update({ id, domain: req.body });

    return res.status(200).json({
      success: true,
      message: "Success",
      data: domain,
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
      Domain.findByIdAndRemove(id).exec((err, data) => {
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

const getAllDomainsByBrandId = async (req, res) => {
  try {
    const { brandId } = req.params;

    const data = await DomainService.getAllDomainsByBrandId(brandId);

    return res.status(200).json(data);
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getDomainsByBrandId = async (req, res) => {
  try {
    const { brandId } = req.query;

    const pageSize = Number(req.query?.pageSize) || 10;
    const pageIndex = Number(req.query?.pageIndex) || 1;
    const search = req.query?.search || "";

    const data = await DomainService.getDomainsByBrandId(
      brandId,
      pageIndex,
      pageSize,
      search
    );

    return res.status(200).json(data);
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error.message,
    });
  }
};
const getAllDomainsByTeamId = async (req, res) => {
  try {
    const { team } = req.params;

    const data = await DomainService.getAllDomainsByTeamId(team);

    return res.status(200).json(data);
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getDomainsByTeamId = async (req, res) => {
  try {
    const { teamId } = req.query;

    const pageSize = Number(req.query?.pageSize) || 10;
    const pageIndex = Number(req.query?.pageIndex) || 1;
    const search = req.query?.search || "";

    const data = await DomainService.getDomainsByTeamId(
      teamId,
      pageIndex,
      pageSize,
      search
    );

    return res.status(200).json(data);
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error.message,
    });
  }
};
const getAll = async (req, res) => {
  try {
    const domain = await DomainService.getAll();

    return res.status(200).json({
      success: true,
      message: "Success",
      data: domain,
    });
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
  getAllDomainsByBrandId,
  getDomainsByBrandId,
  getAll,
  getAllDomainsByTeamId,
};
