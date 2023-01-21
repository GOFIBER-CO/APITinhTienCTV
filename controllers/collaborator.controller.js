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

//get ctv theo teamId
const getCollaboratorsByTeamId = async (req, res) => {
  try {
    const pageSize = Number(req.query?.pageSize) || 10;
    const pageIndex = Number(req.query?.pageIndex) || 1;
    const search = req.query?.search || "";
    const { teamId } = req.query;
    //get domain by teamid
    const listDomainByTeam = await getAllDomainsByTeamId(teamId);
    //get list CTV by domain_id
    const listCTV = listDomainByTeam?.data?.map(async (item) => {
      const dataCTV = await Collaborator.find({ domain_id: item?._id });
      return dataCTV;
    });
    Promise.all(listCTV).then((result) => {
      //handle result gộp tất cả các array thành 1 array
      const totalCTV = [];
      result?.map((item) => {
        item?.map((itemChild) => totalCTV.push(itemChild));
      });
      res.status(200).json(totalCTV);
    });
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error.message,
    });
  }
};

//get CTV by brandId
const getCollaboratorsByBrandId = async (req, res) => {
  try {
    const pageSize = Number(req.query?.pageSize) || 10;
    const pageIndex = Number(req.query?.pageIndex) || 1;
    const search = req.query?.search || "";
    const { brandId } = req.query;

    //get all team by brandId
    const listTeam = await Team.find({ brand: brandId });

    //get domain by teamid
    const listDomainByTeamPr = listTeam?.map(
      async (teamItem) => await getAllDomainsByTeamId(teamItem?._id)
    );

    Promise.all(listDomainByTeamPr).then(async (listDomainByTeam) => {
      // duyệt qua từng domain
      const listCTVPromise = listDomainByTeam?.map(async (domain) => {
        const tempData = domain?.data?.map(async (itemChild) => {
          //tim list ctv trong domain
          return await Collaborator.find({
            domain_id: itemChild?._id,
          });
        });
        return Promise.all(tempData).then((CTVofDomain) => CTVofDomain);
      });
      Promise.all(listCTVPromise).then((result) => {
        const listCTVByBrand = [];
        result?.map((item) => {
          //item là domain by team
          item?.map((itemCTVByDomain) => {
            itemCTVByDomain?.map((itemCTV) => listCTVByBrand.push(itemCTV));
          });
        });
        res.status(200).json(listCTVByBrand);
      });
      // console.log(result);
      // res.status(200).json(result);
    });
    //get list CTV by domain_id
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

module.exports = {
  search,
  create,
  remove,
  update,
  getById,
  getCollaboratorsByDomainId,
  getAllCollaboratorsByDomainId,
  getCollaboratorsByBrand,
  getCollaboratorsByTeamId,
  getCollaboratorsByBrandId,
};
