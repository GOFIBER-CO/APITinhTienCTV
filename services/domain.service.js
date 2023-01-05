const Collaborator = require("../models/collaborator.model");
const Domain = require("../models/domain.model");

const create = async (data) => {
  try {
    const { name, total } = data;

    if (!name || !total) {
      throw { message: "Vui lòng nhập thông tin" };
    }

    const domain = new Domain();

    domain.name = name;
    domain.total = total;

    const newDomain = await domain.save();

    return newDomain;
  } catch (error) {
    throw error;
  }
};

const update = async ({ id, domain }) => {
  try {
    const { name, total } = domain;

    if (!name || !total) {
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

const getDomainsWithCalculate = async () => {
  try {
    const result = await Domain.aggregate([
      {
        $lookup: {
          from: "collaborators",
          localField: "_id",
          foreignField: "domain_id",
          as: "child",
        },
      },
    ]);

    return result;
  } catch (error) {
    console.log("dsad", error);
    throw error;
  }
};

module.exports = {
  create,
  update,
  search,
  getById,
  getDomainsWithCalculate,
};
