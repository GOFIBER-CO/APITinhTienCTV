const LinkManagement = require("../models/linkManagement.model");
const LinkManagementService = require("../services/linkManagement.service");
const { dashLogger } = require("../logger");
const ResponseModel = require("../helpers/ResponseModel");
const googleDoc = require("../helpers/google.doc");
const parseNumberOfWord = require("../helpers/parseNumberOfWord");
const CollaboratorService = require("../services/collaborator.service");
const DomainService = require("../services/domain.service");
const Collaborator = require("../models/collaborator.model");
const { PRICE, LINK_STATUS, genFieldsRequire } = require("../helpers");
const Domain = require("../models/domain.model");
const Brand = require("../models/brand.model");
const Team = require("../models/team.model");
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
    const { link_post, keyword, status, category, collaboratorId } = req.body;

    const collaborators = await Collaborator.aggregate([
      {
        $addFields: {
          collaboratorId: {
            $toString: "$_id",
          },
        },
      },
      {
        $match: {
          collaboratorId,
        },
      },
      {
        $lookup: {
          from: "domains",
          localField: "domain_id",
          foreignField: "_id",
          as: "domain",
        },
      },
      {
        $unwind: "$domain",
      },
      {
        $lookup: {
          from: "teams",
          localField: "domain.team",
          foreignField: "_id",
          as: "team",
        },
      },
      // {
      //   $unwind:"$domain.team"
      // },
      {
        $lookup: {
          from: "brands",
          localField: "team.brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $unwind: "$team",
      },
      {
        $unwind: "$brand",
      },
    ]);
    const [collaborator] = collaborators;

    if (!collaborator) {
      return res.status(400).json({ message: "Not found Collaborator" });
    }

    if (!keyword || !link_post || !category) {
      return res.status(400).json({
        message: "Vui lòng nhập thông tin",
        description: genFieldsRequire({
          keyword,
          link_post,
          category,
        }),
      });
    }

    if (!link_post)
      return res.status(400).json({ messages: `Link post not exist` });

    const link_id = link_post.substring(
      link_post.lastIndexOf("/d/") + 3,
      link_post.indexOf("/edit")
    );

    const doc = await googleDoc.printDoc(link_id);
    const { title, body, inlineObjects } = doc?.data;

    const { number_image, number_word } = parseNumberOfWord(
      body,
      inlineObjects
    );
    const PRICE = req.body.prices_per_word || 60;
    const data = {
      ...req.body,
      status: Number(status || LINK_STATUS.PENDING),
      number_images: number_image,
      number_words: number_word,
      title,
      total: number_word * PRICE,
    };

    const linkManagement = await LinkManagementService.create(data);

    const {
      number_words: oldNumberWord,
      domain,
      team,
      brand,
      link_management_ids,
    } = collaborator;
    const newTotal = number_word * PRICE;

    const newCollaborator = {
      number_words: Number(oldNumberWord) + number_word,
      total: Number(collaborator?.total || 0) + newTotal,
    };

    if (linkManagement?._id)
      newCollaborator.link_management_ids = [
        ...(link_management_ids || []),
        linkManagement?._id,
      ];

    const newDomain = {
      total: Number(domain?.total || 0) + newTotal,
    };
    const newTeam = {
      total: Number(team?.total || 0) + newTotal,
    };
    const newBrand = {
      total: Number(brand?.total || 0) + newTotal,
    };

    const updateCollaborator = Collaborator.updateOne(
      {
        _id: collaborator?._id,
      },
      {
        $set: newCollaborator,
      },
      { upsert: true }
    );

    const updateDomain = Domain.updateOne(
      {
        _id: domain?._id,
      },
      {
        $set: newDomain,
      },
      { upsert: true }
    );
    const updateTeam = Team.updateOne(
      {
        _id: team?._id,
      },
      {
        $set: newTeam,
      },
      { upsert: true }
    );
    const updateBrand = Brand.updateOne(
      {
        _id: brand?._id,
      },
      {
        $set: newBrand,
      },
      { upsert: true }
    );

    Promise.all([updateCollaborator, updateDomain, updateBrand, updateTeam])
      .then()
      .catch(() => {
        return res.status(400).json({ messages: `Error` });
      });

    return res.status(200).json({
      success: true,
      message: "Success",
      data,
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

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const link = await LinkManagementService.getById(id);

    if (!link) {
      dashLogger.error(
        `Error : Not found ${NAME}, Request : ${req.originalUrl}`
      );

      return res.status(400).json({ message: `Not found ${NAME}` });
    }

    const collaborators = await Collaborator.aggregate([
      {
        $set: {
          link_ids: {
            $map: {
              input: "$link_management_ids",
              as: "item",
              in: {
                $toString: "$$item",
              },
            },
          },
        },
      },
      {
        $match: {
          link_ids: { $elemMatch: { $in: [id] } },
        },
      },
      {
        $lookup: {
          from: "domains",
          localField: "domain_id",
          foreignField: "_id",
          as: "domain",
        },
      },
      {
        $unwind: "$domain",
      },
      {
        $lookup: {
          from: "teams",
          localField: "domain.team",
          foreignField: "_id",
          as: "team",
        },
      },
      {
        $unwind: "$team",
      },
      {
        $lookup: {
          from: "brands",
          localField: "team.brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $unwind: "$brand",
      },
    ]);
    const [collaborator] = collaborators;

    if (!collaborator) {
      return res.status(400).json({ message: "Not found Collaborator" });
    }
    const { number_words } = link;
    const { number_words: oldNumberWord, domain, link_ids } = collaborator;
    const { team } = collaborator;
    const { brand } = collaborator;

    const total = number_words * link.prices_per_word;
    const newCollaborator = {
      number_words: Number(oldNumberWord) - number_words,
      total: Number(collaborator?.total || 0) - total,
    };

    newCollaborator.link_management_ids = link_ids?.filter(
      (item) => item !== id
    );

    const newDomain = {
      total: Number(domain?.total || 0) - total,
    };
    const newTeam = {
      total: Number(team?.total || 0) - total,
    };
    const newBrand = {
      total: Number(brand?.total || 0) - total,
    };

    const deleteLink = LinkManagement.findByIdAndRemove(id);

    const updateCollaborator = Collaborator.updateOne(
      {
        _id: collaborator?._id,
      },
      {
        $set: newCollaborator,
      },
      { upsert: true }
    );

    const updateDomain = Domain.updateOne(
      {
        _id: domain?._id,
      },
      {
        $set: newDomain,
      },
      { upsert: true }
    );
    const updateTeam = Domain.updateOne(
      {
        _id: team?._id,
      },
      {
        $set: newTeam,
      },
      { upsert: true }
    );
    const updateBrand = Brand.updateOne(
      {
        _id: brand?._id,
      },
      {
        $set: newBrand,
      },
      { upsert: true }
    );

    Promise.all([
      deleteLink,
      updateCollaborator,
      updateDomain,
      updateBrand,
      updateTeam,
    ])
      .then()
      .catch((err) => {
        dashLogger.error(`Error : ${err}, Request : ${req.originalUrl}`);
        return res.status(400).json({
          message: err.message,
        });
      });

    return res.status(200).json({
      success: true,
      message: `${NAME} is deleted successfully`,
      collaborators,
    });
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getLinkManagementsByCollaboratorId = async (req, res) => {
  try {
    const { collaboratorId } = req.query;

    const pageSize = Number(req.query?.pageSize) || 10;
    const pageIndex = Number(req.query?.pageIndex) || 1;
    const search = req.query?.search || "";
    const data =
      await LinkManagementService.getAllLinkManagementsByCollaboratorId(
        collaboratorId,
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
const getStatisticByBrand = async (req, res) => {
  const pageSize = Number(req.query?.pageSize) || 10;
  const pageIndex = Number(req.query?.pageIndex) || 1;
  const search = req.query?.search || "";
  const dateFrom =
    new Date(req.query?.dateFrom) ||
    new Date(Date.now() - 30 * 60 * 60 * 24 * 1000);
  const dateTo = new Date(req.query?.dateTo) || new Date(Date.now());
  const data = await Brand.aggregate([
    {
      $addFields: {
        id: {
          $toString: "$_id",
        },
      },
    },
    {
      $match: {
        ...(search
          ? {
              name: {
                $regex: ".*" + search + ".*",
                $options: "i",
              },
            }
          : {}),
      },
    },
    {
      $lookup: {
        from: "teams",
        localField: "_id",
        foreignField: "brand",
        pipeline: [
          {
            $lookup: {
              from: "domains",
              localField: "_id",
              foreignField: "team",
              pipeline: [
                {
                  $lookup: {
                    from: "collaborators",
                    localField: "_id",
                    foreignField: "domain_id",
                    as: "collaborators",
                    pipeline: [
                      {
                        $lookup: {
                          from: "linkmanagements",
                          localField: "link_management_ids",
                          foreignField: "_id",
                          as: "link_management_ids",
                        },
                      },
                    ],
                  },
                },
              ],
              as: "domains",
            },
          },
        ],
        as: "team",
      },
    },

    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: Number(pageIndex) * Number(pageSize) - Number(pageSize),
    },
    {
      $limit: Number(pageSize),
    },
    {
      $match: {
        "team.domains.collaborators.link_management_ids.createdAt": {
          $gte: new Date(dateFrom.toISOString()),
          $lte: new Date(dateTo.toISOString()),
        },
      },
    },
  ]);
  return res.status(200).json({ success: true, data });
};
const getStatisticByTeam = async (req, res) => {
  const pageSize = Number(req.query?.pageSize) || 10;
  const pageIndex = Number(req.query?.pageIndex) || 1;
  const search = req.query?.search || "";
  const dateFrom = req.query?.dateFrom;
  const dateTo = req.query?.dateTo;

  const data = await Brand.aggregate([
    {
      $addFields: {
        id: {
          $toString: "$_id",
        },
      },
    },
    {
      $match: {
        ...(search
          ? {
              name: {
                $regex: ".*" + search + ".*",
                $options: "i",
              },
            }
          : {}),
      },
    },
    {
      $lookup: {
        from: "teams",
        localField: "_id",
        foreignField: "brand",
        pipeline: [
          {
            $lookup: {
              from: "domains",
              localField: "_id",
              foreignField: "team",
              pipeline: [
                {
                  $lookup: {
                    from: "collaborators",
                    localField: "_id",
                    foreignField: "domain_id",
                    as: "collaborators",
                    pipeline: [
                      {
                        $lookup: {
                          from: "linkmanagements",
                          localField: "link_management_ids",
                          foreignField: "_id",
                          as: "link_management_ids",
                        },
                        $match: {
                          createdAt: {
                            $gte: ISODate(
                              new Date(new Date() - day * 60 * 60 * 24 * 1000)
                            ),
                            $lte: ISODate(
                              new Date(new Date() - day * 60 * 60 * 24 * 1000)
                            ),
                          },
                        },
                      },
                    ],
                  },
                },
              ],
              as: "domains",
            },
          },
        ],
        as: "team",
      },
    },

    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: Number(pageIndex) * Number(pageSize) - Number(pageSize),
    },
    {
      $limit: Number(pageSize),
    },
  ]);
  return res.status(200).json({ success: true, data });
};

module.exports = {
  search,
  create,
  remove,
  update,
  getById,
  getLinkManagementsByCollaboratorId,
  getStatisticByBrand,
};
