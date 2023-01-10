const Collaborator = require("../models/collaborator.model");
const CollaboratorService = require("../services/collaborator.service");
const { dashLogger } = require("../logger");
const ResponseModel = require("../helpers/ResponseModel");

const NAME = "Collaborator";

const search = async (req, res) => {
  try {
    const pageSize = Number(req.query?.pageSize) || 10;
    const pageIndex = Number(req.query?.pageIndex) || 1;
    const search = req.query?.search || "";

    const data = await CollaboratorService.search(pageSize, pageIndex, search);

    return res.status(200).json(data);
  } catch (error) {
    let response = new ResponseModel(400, error.message, error);
    res.status(400).json(response);
  }
};

const getById = async (req, res) => {
  try {
    const domain = await CollaboratorService.getById(id);

    return res.status(200).json({
      success: true,
      message: "Success",
      data: domain,
    });
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      description: error?.description,
      message: error.message,
    });
  }
};

const create = async (req, res) => {
  try {
    const collaborator = await CollaboratorService.create(req.body);

    return res.status(200).json({
      success: true,
      message: "Success",
      data: collaborator,
    });
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);

    return res.status(400).json({
      description: error?.description,
      message: error?.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;

    const checkIsFound = await Collaborator.findById(id);

    if (!checkIsFound) {
      dashLogger.error(
        `Error : Not found ${NAME}, Request : ${req.originalUrl}`
      );

      return res.status(400).json({ message: `Not found ${NAME}` });
    }

    const collaborator = await CollaboratorService.update({
      id,
      collaborator: req.body,
    });

    return res.status(200).json({
      success: true,
      message: "Success",
      data: collaborator,
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
      Collaborator.findByIdAndRemove(id).exec((err, data) => {
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

const getAllCollaboratorsByDomainId = async (req, res) => {
  try {
    const { domainId } = req.params;

    const data = await CollaboratorService.getAllCollaboratorsByDomainId(
      domainId
    );

    return res.status(200).json(data);
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getCollaboratorsByDomainId = async (req, res) => {
  try {
    const { domainId } = req.query;

    const pageSize = Number(req.query?.pageSize) || 10;
    const pageIndex = Number(req.query?.pageIndex) || 1;
    const search = req.query?.search || "";

    const data = await CollaboratorService.getCollaboratorsByDomainId(
      domainId,
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

const getCollaboratorsByBrand = async (req, res) => {
  try {
    const { brandId } = req.query;
    const pageSize = Number(req.query?.pageSize) || 10;
    const pageIndex = Number(req.query?.pageIndex) || 1;
    const search = req.query?.search || "";

    const data = await CollaboratorService.getCollaboratorsByBrand(
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

module.exports = {
  search,
  create,
  remove,
  update,
  getById,
  getCollaboratorsByDomainId,
  getAllCollaboratorsByDomainId,
  getCollaboratorsByBrand,
};
