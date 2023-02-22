const { genFieldsRequire } = require("../helpers");
const Domain = require("../models/domain.model");
const BrandService = require("../services/brand.service");
const { ObjectId } = require("mongoose").Types.ObjectId;

const create = async (data) => {
  try {
    const { name, total, team, brand, manager } = data;

    if (!name || !team || !brand) {
      throw {
        message: "Vui lòng nhập thông tin",
        description: genFieldsRequire({
          name,
          team,
          brand,
        }),
      };
    }
    const domain = new Domain();

    domain.name = name;
    domain.total = Number(total || 0);
    domain.team = team;
    domain.brand = brand;
    domain.manager = manager || "";
    const newDomain = await domain.save();

    return newDomain;
  } catch (error) {
    throw error;
  }
};

const update = async ({ id, domain }) => {
  try {
    const { name, total, team } = domain;

    if (!name) {
      throw { message: "Vui lòng nhập thông tin" };
    }

    const newDomain = await Domain.findByIdAndUpdate(id, domain, { new: true });

    return newDomain;
  } catch (error) {
    throw error;
  }
};

const search = async (
  pageSize = 10,
  pageIndex = 1,
  search = "",
  dateFrom,
  dateTo,
  team = "",
  brand = ""
) => {
  try {
    let searchObj = {};
    if (search) {
      searchObj.name = { $regex: ".*" + search + ".*" };
    }
    if (team && team !== "undefined") {
      searchObj.team = team;
    }
    if (brand && brand !== "undefined") {
      searchObj.brand = brand;
    }
    if (dateFrom !== "" && dateTo !== "") {
      searchObj.createdAt = { $gte: dateFrom, $lte: dateTo };
    }
    let data = await Domain.find(searchObj)
      .skip(pageSize * pageIndex - pageSize)
      .limit(parseInt(pageSize))
      .populate("team")
      .populate("brand")
      .sort({
        createdAt: "DESC",
      });

    let count = await Domain.find(searchObj).countDocuments();

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
    const domain = await Domain.findById(id).populate("team");

    if (!domain) throw { message: "Not found Domain" };

    return domain;
  } catch (error) {
    throw error;
  }
};

const getAllDomainsByBrandId = async (brandId) => {
  try {
    const result = await Domain.aggregate([
      {
        $addFields: {
          brandId: {
            $toString: "$brand_id",
          },
        },
      },
      {
        $match: {
          brandId,
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand_id",
          foreignField: "_id",
          as: "brand",
        },
      },
    ]);

    return {
      brandId,
      data: result || [],
      count: result?.length || 0,
    };
  } catch (error) {
    throw error;
  }
};
const getAllDomainsByTeamId = async (team, brand) => {
  try {
    const result = await Domain.find({
      team: team.toString(),
      brand: brand.toString(),
    })
      .populate("team")
      .populate("brand");

    return {
      team,
      brand,
      data: result || [],
      count: result?.length || 0,
    };
  } catch (error) {
    throw error;
  }
};
const getDomainsByBrandId = async (
  brandId,
  pageIndex = 1,
  pageSize = 10,
  search = ""
) => {
  try {
    const data = await Domain.aggregate([
      {
        $addFields: {
          brandId: {
            $toString: "$brand_id",
          },
        },
      },
      {
        $match: {
          brandId,
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
          from: "brands",
          localField: "brand_id",
          foreignField: "_id",
          as: "brand",
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

    const count = await Domain.find({
      brand_id: brandId,
      ...(search
        ? {
            name: {
              $regex: ".*" + search + ".*",
              $options: "i",
            },
          }
        : {}),
    }).countDocuments();

    let totalPages = Math.ceil(count / pageSize);

    return {
      pageIndex,
      pageSize,
      data,
      count,
      brandId,
      totalPages,
    };
  } catch (error) {
    throw error;
  }
};
const getDomainsByTeamId = async (
  teamId,
  pageIndex = 1,
  pageSize = 10,
  search = ""
) => {
  try {
    const data = await Domain.aggregate([
      {
        $addFields: {
          teamId: {
            $toString: "$team_id",
          },
        },
      },
      {
        $match: {
          teamId,
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
          from: "team",
          localField: "team_id",
          foreignField: "_id",
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
        $limit: Number(pageSize) || 9999999,
      },
    ]);

    const count = await Domain.find({
      brand_id: brandId,
      ...(search
        ? {
            name: {
              $regex: ".*" + search + ".*",
              $options: "i",
            },
          }
        : {}),
    }).countDocuments();

    let totalPages = Math.ceil(count / pageSize);

    return {
      pageIndex,
      pageSize,
      data,
      count,
      teamId,
      totalPages,
    };
  } catch (error) {
    throw error;
  }
};
const getAll = async () => {
  try {
    const domain = await Domain.find();

    if (!domain) throw { message: "Not found domain" };

    return domain;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  update,
  search,
  getById,
  getAllDomainsByBrandId,
  getAllDomainsByTeamId,
  getDomainsByBrandId,
  getDomainsByTeamId,
  getAll,
};
