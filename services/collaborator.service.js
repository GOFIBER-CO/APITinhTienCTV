const { default: mongoose } = require("mongoose");
const { genFieldsRequire } = require("../helpers");
const Brand = require("../models/brand.model");
const Collaborator = require("../models/collaborator.model");

const create = async (data) => {
  try {
    const { name, stk, account_holder, domain_id, bank_name, note } = data;

    if (!name || !stk || !account_holder || !domain_id || !bank_name) {
      throw {
        message: "Vui lòng nhập thông tin",
        description: genFieldsRequire({
          name,
          stk,
          account_holder,
          domain_id,
          bank_name,
        }),
      };
    }

    const collaborator = new Collaborator({
      ...data,
    });

    const newCollaborator = await collaborator.save();

    return newCollaborator;
  } catch (error) {
    throw error;
  }
};

const update = async ({ id, collaborator }) => {
  try {
    // const { name, stk, account_holder, note, bank_name } = collaborator;

    // if (!name || !stk || !account_holder || !note || !bank_name) {
    //   throw { message: "Vui lòng nhập thông tin" };
    // }

    const newCollaborator = await Collaborator.findByIdAndUpdate(
      id,
      collaborator,
      {
        new: true,
      }
    );

    return newCollaborator;
  } catch (error) {
    console.log(error.message);
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
                name: {
                  $regex: ".*" + search + ".*",
                  $options: "i",
                },
              },
              {
                bank_name: {
                  $regex: ".*" + search + ".*",
                  $options: "i",
                },
              },
              {
                stk: {
                  $regex: ".*" + search + ".*",
                  $options: "i",
                },
              },
              {
                account_holder: {
                  $regex: ".*" + search + ".*",
                  $options: "i",
                },
              },
            ],
          }
        : {}),
    };

    let data = await Collaborator.find(searchObj)
      .skip(pageSize * pageIndex - pageSize)
      .limit(parseInt(pageSize))
      .sort({
        createdAt: "DESC",
      });

    let count = await Collaborator.find(searchObj).countDocuments();

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
    const collaborator = await Collaborator.findById(id).populate("domain_id");

    if (!collaborator) throw { message: "Not found Collaborator" };

    return collaborator;
  } catch (error) {
    throw error;
  }
};

const getAllCollaboratorsByDomainId = async (domainId) => {
  try {
    const result = await Collaborator.aggregate([
      {
        $addFields: {
          domainId: {
            $toString: "$domain_id",
          },
        },
      },
      {
        $match: {
          domainId,
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
    ]);

    return {
      domainId,
      data: result || [],
      count: result?.length || 0,
    };
  } catch (error) {
    throw error;
  }
};

const getCollaboratorsByDomainId = async (
  domainId = "",
  team = "",
  brand = "",
  pageIndex = 1,
  pageSize = 10,
  search = "",
  dateFrom = "",
  dateTo = ""
) => {
  console.log(dateFrom, dateTo, "aaa");
  try {
    const data = await Collaborator.aggregate([
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
          from: "linkmanagements",
          localField: "link_management_ids",
          foreignField: "_id",
          as: "link_management_ids",
        },
      },
      {
        $lookup: {
          from: "domains",
          localField: "domain_id",
          foreignField: "_id",
          as: "domain",
          pipeline: [
            {
              $match: {
                brand: brand ? mongoose.Types.ObjectId(brand) : { $ne: null },
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
          domain_id: domainId
            ? mongoose.Types.ObjectId(domainId)
            : { $ne: null },
        },
      },
      // {
      //   $match: {
      //     "domain.brand._id": brand
      //       ? mongoose.Types.ObjectId(brand)
      //       : { $ne: null },
      //   },
      // },

      {
        $match: {
          $and: [
            { "domain.brand._id": mongoose.Types.ObjectId(brand) },
            {
              "domain.team._id": team
                ? mongoose.Types.ObjectId(team)
                : { $ne: null },
            },
          ],
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
    const count = await Collaborator.aggregate([
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
          from: "domains",
          localField: "domain_id",
          foreignField: "_id",
          as: "domain",
          pipeline: [
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
          domain_id: domainId
            ? mongoose.Types.ObjectId(domainId)
            : { $ne: null },
        },
      },
      {
        $match: {
          "domain.brand._id": brand
            ? mongoose.Types.ObjectId(brand)
            : { $ne: null },
        },
      },
      {
        $match: {
          "domain.team._id": team
            ? mongoose.Types.ObjectId(team)
            : { $ne: null },
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
    throw error;
  }
};

const getCollaboratorsByBrand = async (
  brandId,
  pageIndex,
  pageSize,
  search,
  dateFrom,
  dateTo
) => {
  try {
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
          ...(brandId ? { id: brandId } : {}),
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
          from: "domains",
          localField: "_id",
          foreignField: "brand_id",
          pipeline: [
            {
              $lookup: {
                from: "collaborators",
                localField: "_id",
                foreignField: "domain_id",
                as: "collaborators",
              },
            },
          ],
          as: "domains",
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

    const count = data?.length || 0;
    let totalPages = Math.ceil(count / pageSize);

    return {
      brandId,
      count: data?.length || 0,
      pageIndex,
      pageSize,
      totalPages,
      data,
    };
  } catch (error) {
    throw error;
  }
};
const getStatisticByBrand = async (
  brandId,
  pageIndex,
  pageSize,
  search,
  dateFrom,
  dateTo
) => {};
module.exports = {
  create,
  update,
  search,
  getById,
  getCollaboratorsByDomainId,
  getAllCollaboratorsByDomainId,
  getCollaboratorsByBrand,
};
