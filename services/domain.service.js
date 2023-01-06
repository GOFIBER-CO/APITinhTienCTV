const Brand = require("../models/brand.model");
const Collaborator = require("../models/collaborator.model");
const Domain = require("../models/domain.model");
const BrandService = require("../services/brand.service");

const create = async (data) => {
  try {
    const { name, total, brand_id } = data;

    if (!name ) {
      throw { message: "Vui lòng nhập thông tin" };
    }

    const brand = await BrandService.getById(brand_id);

    const domain = new Domain();

    domain.name = name;
    domain.total = Number(total || 0);
    domain.brand_id = brand._id;

    const newDomain = await domain.save();

    return newDomain;
  } catch (error) {
    throw error;
  }
};

const update = async ({ id, domain }) => {
  try {
    const { name, total } = domain;

    if (!name ) {
      throw { message: "Vui lòng nhập thông tin" };
    }

    const newDomain = await Domain.findByIdAndUpdate(id, domain);

    return newDomain;
  } catch (error) {
    throw error;
  }
};

const search = async (pageSize = 10, pageIndex = 1, search = "") => {
  try {
    let searchObj = {};
    if (search) {
      searchObj.name = { $regex: ".*" + search + ".*" };
    }

    let data = await Domain.find(searchObj)
      .skip(pageSize * pageIndex - pageSize)
      .limit(parseInt(pageSize))
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
    const domain = await Domain.findById(id);

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

module.exports = {
  create,
  update,
  search,
  getById,
  getAllDomainsByBrandId,
};
