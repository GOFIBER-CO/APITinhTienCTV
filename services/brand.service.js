const Brand = require("../models/brand.model");

const create = async (data) => {
  try {
    const { name, total } = data;

    if (!name) {
      throw { message: "Vui lòng nhập thông tin" };
    }

    const brand = new Brand();

    brand.name = name;
    brand.total = Number(total || 0);

    const newBrand = await brand.save();

    return newBrand;
  } catch (error) {
    throw error;
  }
};

const update = async ({ id, brand }) => {
  try {
    const { name, total } = brand;

    if (!name ) {
      throw { message: "Vui lòng nhập thông tin" };
    }

    const newBrand = await Brand.findByIdAndUpdate(id, brand);

    return newBrand;
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

    let data = await Brand.find(searchObj)
      .skip(pageSize * pageIndex - pageSize)
      .limit(parseInt(pageSize))
      .sort({
        createdAt: "DESC",
      });

    let count = await Brand.find(searchObj).countDocuments();

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
    const brand = await Brand.findById(id);

    if (!brand) throw { message: "Not found Brand" };

    return brand;
  } catch (error) {
    throw error;
  }
};

const getAll = async (id) => {
  try {
    const brand = await Brand.find();

    if (!brand) throw { message: "Not found Brand" };

    return brand;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  update,
  search,
  getById,
  getAll
};
