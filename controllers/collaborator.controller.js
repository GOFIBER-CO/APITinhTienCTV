const Collaborator = require("../models/collaborator.model");
const CollaboratorService = require("../services/collaborator.service");
const { dashLogger } = require("../logger");
const ResponseModel = require("../helpers/ResponseModel");
const Team = require("../models/team.model");
const {
  getDomainsByTeamId,
  getAllDomainsByTeamId,
} = require("../services/domain.service");
const { getTeamByBrand } = require("./team.controller");
const teamController = require("./team.controller");
const Domain = require("../models/domain.model");
const PagedModel = require("../models/PagedModel");

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
    const id = req.params.id;
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

const remove = async (req, res) => {
  const { id } = req.params;
  try {
    if (id) {
      const colab = await Collaborator.findById(id);
      if (colab.link_management_ids.length > 0) {
        res.status(400).json({
          success: false,
          message: "Cộng tác viên còn các bài viết nên không thể xóa",
        });
      } else {
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
      }
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
    const { brand, domainId, team } = req.query;
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;
    const pageSize = Number(req.query?.pageSize) || 10;
    const pageIndex = Number(req.query?.pageIndex) || 1;
    const search = req.query?.search || "";

    const data = await CollaboratorService.getCollaboratorsByDomainId(
      domainId,
      team,
      brand,
      pageIndex,
      pageSize,
      search,
      dateFrom,
      dateTo
    );

    return res.status(200).json(data);
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error.message,
    });
  }
};

//get ctv theo teamId
const getAllCollaboratorsByTeamId = async (req, res) => {
  try {
    const pageSize = Number(req.query?.pageSize) || 10;
    const pageIndex = Number(req.query?.pageIndex) || 1;
    const search = req.query?.search || "";
    const { teamId } = req.query;
    //get domain by teamid
    const listDomainByTeam = await Domain.find({ team: teamId });
    const listIdDomain = listDomainByTeam?.map((item) => item?._id);
    // lấy danh sách CTV theo danh sách id domain đã filter ở trên

    const listCTV = await Collaborator.find({
      domain_id: listIdDomain,
      name: {
        $regex: ".*" + search + ".*",
        $options: "i",
      },
    })
      .skip(Number(pageIndex) * Number(pageSize) - Number(pageSize))
      .limit(Number(pageSize));
    res.status(200).json(listCTV);
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error.message,
    });
  }
};

//get CTV by domain
const getAllCollaboratorsByDomain = async (req, res) => {
  try {
    const domain = req.query.domain || "";
    const data = await Collaborator.find({
      domain_id: domain,
    });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error });
  }
};

//get CTV by brandId
const getAllCollaboratorsByBrandId = async (req, res) => {
  try {
    const pageSize = Number(req.query?.pageSize) || 10;
    const pageIndex = Number(req.query?.pageIndex) || 1;
    const search = req.query?.search || "";
    const { brandId } = req.query;

    //get all team by brandId
    const listTeam = await Team.find({ brand: brandId }).select("_id");
    const listIdTeam = listTeam?.map((item) => item?._id);
    //get domain by teamid
    const listDomainByTeam = await Domain.find({ team: listIdTeam });
    const listIdDomain = listDomainByTeam?.map((item) => item?._id);
    // lấy danh sách CTV theo danh sách id domain đã filter ở trên
    const listCTV = await Collaborator.find({
      domain_id: listIdDomain,
      name: {
        $regex: ".*" + search + ".*",
        $options: "i",
      },
    })
      .skip(Number(pageIndex) * Number(pageSize) - Number(pageSize))
      .limit(Number(pageSize));
    res.status(200).json(listCTV);
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
    const dateFrom = req.query?.dateFrom;
    const dateTo = req.query?.dateTo;
    const data = await CollaboratorService.getCollaboratorsByBrand(
      brandId,
      pageIndex,
      pageSize,
      search,
      dateFrom,
      dateTo
    );
    return res.status(200).json(data);
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error.message,
    });
  }
};
const getDomainByCollaborator = async (req, res) => {
  try {
    const id = req.params.id;
    const colab = await Collaborator.findById(id);
    res.status(200).json({ success: true, colab });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
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
  getAllCollaboratorsByTeamId,
  getAllCollaboratorsByBrandId,
  getAllCollaboratorsByDomain,
};
