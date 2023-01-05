const Collaborator = require("../models/collaborator.model");

const create = async (data) => {
  try {
    const { name, stk, account_holder, category, domain_id } = data;

    if (!name || !stk || !account_holder || !category || !domain_id) {
      throw { message: "Vui lòng nhập thông tin" };
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
    const { name, stk, account_holder, category, domain_id } = collaborator;

    if (!name || !stk || !account_holder || !category || !domain_id) {
      throw { message: "Vui lòng nhập thông tin" };
    }

    const newCollaborator = await Collaborator.findByIdAndUpdate(
      id,
      collaborator
    );

    return newCollaborator;
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
    const collaborator = await Collaborator.findById(id);

    if (!collaborator) throw { message: "Not found Collaborator" };

    return collaborator;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  update,
  search,
  getById,
};
