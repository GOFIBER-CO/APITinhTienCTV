const { default: mongoose } = require("mongoose");
const { LINK_STATUS } = require("../helpers");
const Collaborator = require("../models/collaborator.model");
const LinkManagement = require("../models/linkManagement.model");

const create = async (data) => {
  try {
    const { link_post, number_words, category, status, keyword } = data;

    // if (!link_post || !category || !keyword) {
    //   throw { message: "Vui lòng nhập thông tin" };
    // }

    const linkManagement = new LinkManagement({
      ...data,
    });

    linkManagement.keyword = keyword;
    linkManagement.link_post = link_post;
    linkManagement.number_words = number_words;
    linkManagement.category = category;
    linkManagement.status = Number(status || LINK_STATUS.PENDING);

    const newLinkManagement = await linkManagement.save();

    return newLinkManagement;
  } catch (error) {
    throw error;
  }
};

const update = async ({ id, linkManagement }) => {
  try {
    const newLinkManagement = await LinkManagement.findByIdAndUpdate(
      id,
      linkManagement,
      {
        new: true,
      }
    );

    return newLinkManagement;
  } catch (error) {
    throw error;
  }
};

const search = async (pageSize = 10, pageIndex = 1, search = "") => {
  try {
    let searchObj = {
      ...(search
        ? {
            $or: [
              {
                title: {
                  $regex: ".*" + search + ".*",
                  $options: "i",
                },
              },
              {
                keyword: {
                  $regex: ".*" + search + ".*",
                  $options: "i",
                },
              },
            ],
          }
        : {}),
    };

    let data = await LinkManagement.find(searchObj)
      .skip(pageSize * pageIndex - pageSize)
      .limit(parseInt(pageSize))
      .sort({
        createdAt: "DESC",
      });

    let count = await LinkManagement.find(searchObj).countDocuments();

    let totalPages = Math.ceil(count / pageSize);

    let pagedModel = {
      pageIndex,
      pageSize,
      totalPages,
      data,
      count,
    };

    return pagedModel;
  } catch (error) {
    throw error;
  }
};

const getById = async (id) => {
  try {
    const linkManagement = await LinkManagement.findById(id);

    if (!linkManagement) throw { message: "Not found Link Management" };

    return linkManagement;
  } catch (error) {
    throw error;
  }
};

const getAllLinkManagementsExcelTeam = async (brand = "", team = "") => {
  try {
    const data = await LinkManagement.aggregate([
      [
        {
          $lookup: {
            from: "collaborators",
            localField: "_id",
            foreignField: "link_management_ids",
            as: "collaborators",
            pipeline: [
              {
                $lookup: {
                  from: "domains",
                  localField: "domain_id",
                  foreignField: "_id",
                  as: "domain",
                  pipeline: [
                    {
                      $match: {
                        brand: brand
                          ? mongoose.Types.ObjectId(brand)
                          : { $ne: null },
                      },
                    },
                    {
                      $lookup: {
                        from: "brands",
                        localField: "brand",
                        foreignField: "_id",
                        as: "brand",
                      },
                    },
                    {
                      $lookup: {
                        from: "teams",
                        localField: "team",
                        foreignField: "_id",
                        as: "team",
                      },
                    },
                    {
                      $match: {
                        $and: [
                          {
                            "domain.brand._id": brand
                              ? mongoose.Types.ObjectId(brand)
                              : { $ne: null },
                          },
                          {
                            "domain.team._id": team
                              ? mongoose.Types.ObjectId(team)
                              : { $ne: null },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
          //
        },
      ],
    ]);

    return data;
  } catch (error) {
    console.log(error);
  }
};

const getAllLinkManagementsByCollaboratorId = async (
  domainId = "",
  team = "",
  brand = "",
  colabId = "",
  pageIndex = 1,
  pageSize = 10,
  search = "",
  dateFrom,
  dateTo
) => {
  try {
    const data = await LinkManagement.aggregate([
      {
        $match: {
          ...(search
            ? {
                $or: [
                  {
                    title: {
                      $regex: ".*" + search + ".*",
                      $options: "i",
                    },
                  },
                  {
                    keyword: {
                      $regex: ".*" + search + ".*",
                      $options: "i",
                    },
                  },
                ],
              }
            : {}),
        },
      },
      {
        $addFields: {
          linkid: "$_id",
        },
      },
      {
        $lookup: {
          from: "collaborators",
          localField: "_id",
          foreignField: "link_management_ids",
          as: "collaborators",
          let: { linkid: "$linkid" },
          pipeline: [
            {
              $lookup: {
                from: "domains",
                localField: "domain_id",
                foreignField: "_id",
                as: "domain",
                pipeline: [
                  {
                    $match: {
                      brand: brand ? mongoose.Types.ObjectId(brand) : "",
                    },
                  },
                  {
                    $lookup: {
                      from: "brands",
                      localField: "brand",
                      foreignField: "_id",
                      as: "brand",
                    },
                  },
                  {
                    $lookup: {
                      from: "teams",
                      localField: "team",
                      foreignField: "_id",
                      as: "team",
                    },
                  },
                ],
              },
            },
            {
              $match: {
                $and: [
                  {
                    "domain.brand._id": brand
                      ? mongoose.Types.ObjectId(brand)
                      : "",
                  },
                  {
                    "domain.team._id": team
                      ? mongoose.Types.ObjectId(team)
                      : { $ne: null },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        $match: {
          $and: [
            {
              "collaborators.domain.brand._id": brand
                ? mongoose.Types.ObjectId(brand)
                : "",
            },
            {
              "collaborators.domain.team._id": team
                ? mongoose.Types.ObjectId(team)
                : { $ne: null },
            },
            {
              "collaborators._id": colabId
                ? mongoose.Types.ObjectId(colabId)
                : { $ne: null },
            },
          ],
        },
      },
      {
        $match: {
          domain: domainId ? mongoose.Types.ObjectId(domainId) : { $ne: null },
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
        $lookup: {
          from: "domains",
          localField: "domain",
          foreignField: "_id",
          as: "domain",
        },
      },
      {
        $unwind: "$domain",
      },
      {
        $match: {
          ...(dateFrom !== "undefined" && dateTo !== "undefined"
            ? {
                $and: [
                  {
                    createdAt: { $gte: new Date(dateFrom) },
                  },
                  {
                    createdAt: { $lte: new Date(dateTo) },
                  },
                ],
              }
            : {}),
        },
      },
    ]);
    const count = await LinkManagement.aggregate([
      {
        $match: {
          ...(search
            ? {
                $or: [
                  {
                    title: {
                      $regex: ".*" + search + ".*",
                      $options: "i",
                    },
                  },
                  {
                    keyword: {
                      $regex: ".*" + search + ".*",
                      $options: "i",
                    },
                  },
                ],
              }
            : {}),
        },
      },
      {
        $addFields: {
          linkid: "$_id",
        },
      },
      {
        $lookup: {
          from: "collaborators",
          localField: "_id",
          foreignField: "link_management_ids",
          as: "collaborators",
          let: { linkid: "$linkid" },
          pipeline: [
            {
              $lookup: {
                from: "domains",
                localField: "domain_id",
                foreignField: "_id",
                as: "domain",
                pipeline: [
                  {
                    $match: {
                      brand: brand ? mongoose.Types.ObjectId(brand) : "",
                    },
                  },
                  {
                    $lookup: {
                      from: "brands",
                      localField: "brand",
                      foreignField: "_id",
                      as: "brand",
                    },
                  },
                  {
                    $lookup: {
                      from: "teams",
                      localField: "team",
                      foreignField: "_id",
                      as: "team",
                    },
                  },
                ],
              },
            },
            {
              $match: {
                $and: [
                  {
                    "domain.brand._id": brand
                      ? mongoose.Types.ObjectId(brand)
                      : "",
                  },
                  {
                    "domain.team._id": team
                      ? mongoose.Types.ObjectId(team)
                      : { $ne: null },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        $match: {
          $and: [
            {
              "collaborators.domain.brand._id": brand
                ? mongoose.Types.ObjectId(brand)
                : "",
            },
            {
              "collaborators.domain.team._id": team
                ? mongoose.Types.ObjectId(team)
                : { $ne: null },
            },
            {
              "collaborators._id": colabId
                ? mongoose.Types.ObjectId(colabId)
                : { $ne: null },
            },
          ],
        },
      },
      {
        $match: {
          domain: domainId ? mongoose.Types.ObjectId(domainId) : { $ne: null },
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
        $lookup: {
          from: "domains",
          localField: "domain",
          foreignField: "_id",
          as: "domain",
        },
      },
      {
        $unwind: "$domain",
      },
      {
        $match: {
          ...(dateFrom !== "undefined" && dateTo !== "undefined"
            ? {
                $and: [
                  {
                    createdAt: { $gte: new Date(dateFrom) },
                  },
                  {
                    createdAt: { $lte: new Date(dateTo) },
                  },
                ],
              }
            : {}),
        },
      },
    ]);
    let totalPages = Math.ceil(count?.length / pageSize);
    return {
      pageIndex,
      pageSize,
      data,
      count: count?.length || 0,
      totalPages,
    };
  } catch (error) {
    console.log(error, "aa");
    throw error;
  }
};

const getAllLinkManagementsByDomainId = async (
  collaboratorId,
  pageIndex = 1,
  pageSize = 10,
  search = ""
) => {
  try {
    const result = await Collaborator.aggregate([
      {
        $addFields: {
          id: {
            $toString: "$domain_id",
          },
        },
      },
      {
        $match: {
          id: collaboratorId,
        },
      },
      {
        $set: {
          link_management_id: {
            $map: {
              input: "$link_management_ids",
              as: "item",
              in: {
                $toObjectId: "$$item",
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "linkmanagements",
          localField: "link_management_id",
          foreignField: "_id",
          pipeline: [
            {
              $match: {
                ...(search
                  ? {
                      $or: [
                        {
                          title: {
                            $regex: ".*" + search + ".*",
                            $options: "i",
                          },
                        },
                        {
                          keyword: {
                            $regex: ".*" + search + ".*",
                            $options: "i",
                          },
                        },
                      ],
                    }
                  : {}),
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
          ],
          as: "linkManagements",
        },
      },
      {
        $addFields: {
          count: {
            $size: "$linkManagements",
          },
        },
      },
      {
        $project: {
          data: {
            $slice: [
              "$linkManagements",
              pageIndex * pageSize - pageSize,
              pageIndex * pageSize,
            ],
          },
          count: 1,
        },
      },
    ]);
    let count = result[0]?.count || 0;
    let totalPages = Math.ceil(count / pageSize);

    return {
      pageIndex,
      pageSize,
      collaboratorId: result[0]?._id,
      count,
      totalPages,
      data: result[0]?.data || [],
    };
  } catch (error) {
    throw error;
  }
};
module.exports = {
  create,
  update,
  search,
  getById,
  getAllLinkManagementsByCollaboratorId,
  getAllLinkManagementsByDomainId,
  getAllLinkManagementsExcelTeam,
};
