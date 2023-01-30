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

const getAllLinkManagementsByCollaboratorId = async (
  domainId = "",
      team = "",
      brand = "",
      coladId = "",
  pageIndex = 1,
  pageSize = 10,
  search = ""
) => {
  try {
    const data = await LinkManagement.aggregate([
      {
        $addFields: {
          coladId: {
            $toString: "$_id",
          },
        },
      },
      {
        $lookup:{
          from:"collaborators",
          localField:"_id",
          foreignField: "link_management_ids",
          pipeline:[
            {
              $lookup:{
                from:"domains",
                localField: "domain_id",
                foreignField: "_id",
                pipeline:[
                  {
                    $lookup:{
                      from: "teams",
                      localField:"team",
                      foreignField:"_id",
                      pipeline:[],
                      as:"team",
                    },
                  },
                  {
                    $unwind:"$team"
                  },
                ],
                as :"domain"
              },
             
            },
            {
              $unwind: "$domain"
            }
          ],
          as : "collaborator"
        }
      },
      {
        $unwind: "$collaborator"
      },
      {
        $set:{
          colad_ids: {
            $map: {
              input: "$collaborator.domain.team.brand",
              as: "item",
              in:{
                $toString: "$$item"
              },
            },
          },
        },
      },
      {
        $addFields: {
          teamId: {
            $toString: "$collaborator.domain.team._id",
          },
          domain_id: {
            $toString:"$collaborator.domain._id"
          },
          colad_id: {
            $toString: "$collaborator._id"
          }
        },
      },
      {
        $match:{
          colad_ids: {$elemMatch : { $in : [brand] }},
          ...(team
            ?{
              teamId : team,
            }: {}),
          ...(domainId
            ?{
              domain_id: domainId
            }:{}),
          ...(coladId
            ?{colad_id : coladId
            }:{}),
        }
      },
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
      {
        $skip: Number(pageIndex) * Number(pageSize) - Number(pageSize),
      },
      {
        $limit: Number(pageSize) || 9999999,
      },
    ]);
    const count = await LinkManagement.aggregate([
      {
        $addFields: {
          coladId: {
            $toString: "$_id",
          },
        },
      },
      {
        $lookup:{
          from:"collaborators",
          localField:"_id",
          foreignField: "link_management_ids",
          pipeline:[
            {
              $lookup:{
                from:"domains",
                localField: "domain_id",
                foreignField: "_id",
                pipeline:[
                  {
                    $lookup:{
                      from: "teams",
                      localField:"team",
                      foreignField:"_id",
                      pipeline:[],
                      as:"team",
                    },
                  },
                  {
                    $unwind:"$team"
                  },
                ],
                as :"domain"
              },
             
            },
            {
              $unwind: "$domain"
            }
          ],
          as : "collaborator"
        }
      },
      {
        $unwind: "$collaborator"
      },
      {
        $set:{
          colad_ids: {
            $map: {
              input: "$collaborator.domain.team.brand",
              as: "item",
              in:{
                $toString: "$$item"
              },
            },
          },
        },
      },
      {
        $addFields: {
          teamId: {
            $toString: "$collaborator.domain.team._id",
          },
          domain_id: {
            $toString:"$collaborator.domain._id"
          },
          colad_id: {
            $toString: "$collaborator._id"
          }
        },
      },
      {
        $match:{
          colad_ids: {$elemMatch : { $in : [brand] }},
          ...(team
            ?{
              teamId : team,
            }: {}),
          ...(domainId
            ?{
              domain_id: domainId
            }:{}),
          ...(coladId?{colad_id : coladId}:{}),
        }
      },
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
      {
        $skip: Number(pageIndex) * Number(pageSize) - Number(pageSize),
      },
      {
        $limit: Number(pageSize) || 9999999,
      },
    ]);
    let totalPages = Math.ceil(count?.length / pageSize);
    return {
      pageIndex,
      pageSize,
      data,
      count: count?.length || 0,
      totalPages,
    }
    
  } catch (error) {
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
    console.log(result);
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
};
