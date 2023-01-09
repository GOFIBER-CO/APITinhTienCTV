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
    const collaborator = await Collaborator.findById(id);

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
  domainId,
  pageIndex = 1,
  pageSize = 10,
  search = ""
) => {
  try {
    const data = await Collaborator.aggregate([
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

    const count = await Collaborator.find({
      domain_id: domainId,
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
      domainId,
      totalPages,
    };
  } catch (error) {
    throw error;
  }
};

const getCollaboratorsByBrand = async (brandId) => {
  try {
    const result = await Brand.aggregate([
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
    ]);

    return {
      brandId,
      count: result?.length || 0,
      data: result || [],
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
  getCollaboratorsByDomainId,
  getAllCollaboratorsByDomainId,
  getCollaboratorsByBrand,
};
