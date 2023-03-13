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
const { default: mongoose } = require("mongoose");
const { datacatalog } = require("googleapis/build/src/apis/datacatalog");
const parseRounding = require("../helpers/parseRouding");
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

const createExcel = async (req, res) => {
  try {
    const data = req.body;
    let countSuccess = 0;
    let countMatch = 0;
    const result = await Promise.all(
      data.map(async (item) => {
        let a = {
          link_post: item?.link_post,
          link_posted: item?.link_posted,
          status: item?.status,
          category: item?.category,
          keyword: item?.keyword,
          collaboratorId: item?.collaboratorId,
          domain: item?.domain,
          price_per_word: item?.price_per_word,
          total: item?.total,
          isPosted: item?.isPosted || 0,
          isDesign: item?.isDesign || 0,
        };

        const {
          link_post,
          link_posted,
          status,
          category,
          keyword,
          collaboratorId,
          price_per_word,
          total,
          isDesign,
          isPosted,
        } = a;
        let id_post = link_post?.split("/")[5];
        const checkExists = await LinkManagement.findOne({
          link_post: { $regex: id_post },
        });
        console.log(checkExists, "asdsadsa");
        if (checkExists) {
          countMatch++;
          return;
        }
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

        const PRICE = price_per_word;
        const totalPrices = Number(total);
        const totalExtras =
          (isPosted === 1 ? Number(process.env.isPosted) : 0) +
          (isDesign ? Number(process.env.isDesign) : 0);
        // return
        const data = {
          ...a,
          status: Number(status || LINK_STATUS.PENDING),
          number_images: number_image,
          number_words: number_word,
          title,
          total: (number_word * PRICE || totalPrices) + totalExtras,
        };

        const linkManagement = await LinkManagementService.create(data);

        const {
          number_words: oldNumberWord,
          domain,
          team,
          brand,
          link_management_ids,
        } = collaborator;

        const newTotal = (number_word * PRICE || totalPrices) + totalExtras;

        let newCollaborator = {
          number_words: Number(oldNumberWord) + number_word,
          total: newTotal,
        };

        if (linkManagement?._id) {
          newCollaborator.link_management_ids = [
            ...(link_management_ids || []),
            linkManagement._id,
          ];
        }

        const newDomain = {
          total: newTotal,
        };
        const newTeam = {
          total: newTotal,
        };
        const newBrand = {
          total: newTotal,
        };
        const updateCollaborator = async () => {
          const colab = await Collaborator.updateOne(
            {
              _id: collaborator?._id,
            },
            {
              $addToSet: {
                link_management_ids: newCollaborator?.link_management_ids,
              },
              number_words: Number(newCollaborator.number_words || "1"),
              $inc: {
                total: +newCollaborator.total,
              },
            },
            { upsert: true }
          );

          return colab;
        };
        const updateDomain = async () => {
          const domain1 = await Domain.updateOne(
            {
              _id: domain?._id,
            },
            {
              $inc: {
                total: +newDomain.total,
              },
            },
            // {
            //   $set: newDomain,
            // },
            { upsert: true }
          );
          return domain1;
        };
        const updateTeam = async () => {
          const team1 = await Team.updateOne(
            {
              _id: team?._id,
            },
            {
              $inc: {
                total: +newTeam.total,
              },
            },
            // {
            //   $set: newTeam,
            // },
            { upsert: true }
          );
          return team1;
        };
        const updateBrand = async () => {
          const brand1 = await Brand.updateOne(
            {
              _id: brand?._id,
            },
            {
              $inc: {
                total: +newBrand.total,
              },
            },
            // {
            //   $set: newBrand,
            // },
            { upsert: true }
          );
          return brand1;
        };

        // console.log(updateCollaborator,updateDomain,updateTeam, updateBrand,'newCollaborator');
        // return
        const [colabs, domains, brands, teams] = await Promise.all([
          updateCollaborator(),
          updateDomain(),
          updateBrand(),
          updateTeam(),
        ]);
        countSuccess++;
        return true;
      })
    )
      .then((result) => console.log(result, "aaaaa"))
      .catch((error) => {
        console.log(error, "asdasd");
      });
    return res
      .status(200)
      .json({ message: "success", status: 1, countSuccess, countMatch });
  } catch (error) {
    console.log(error);
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error?.message,
    });
  }
};
const create = async (req, res) => {
  // return
  try {
    const {
      link_post,
      keyword,
      status,
      category,
      collaboratorId,
      isPosted,
      isDesign,
    } = req.body;
    let id_post = link_post?.split("/")[5];
    //check if exists link
    const checkExists = await LinkManagement.findOne({
      link_post: { $regex: id_post },
    });

    if (checkExists) {
      return res.json({ success: false, message: "Bài post đã tồn tại!" });
    }
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

    // console.log(collaborator, 'sàddsa');
    // return;
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

    const PRICE = req.body.price_per_word;
    const totalPrices = Number(req.body.total);
    const totalExtra =
      (isPosted === 1 ? Number(process.env.isPosted) : 0) +
      (isDesign ? Number(process.env.isDesign) : 0);
    const data = {
      ...req.body,
      status: Number(status || LINK_STATUS.PENDING),
      number_images: number_image,
      number_words: number_word,
      title,
      total: parseRounding((number_word * PRICE || totalPrices) + totalExtra),
    };

    const linkManagement = await LinkManagementService.create(data);

    const {
      number_words: oldNumberWord,
      domain,
      team,
      brand,
      link_management_ids,
    } = collaborator;
    const newTotal = parseRounding(
      (number_word * PRICE || totalPrices) + totalExtra
    );

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
    const {
      link_posted,
      keyword,
      category,
      status,
      price_per_word,
      collaboratorId,
      total,
      isTotal,
    } = req.body;
    // console.log(req.body, 'ádsad');
    // return ;
    const checkIsFound = await LinkManagement.findById(id);
    // console.log(checkIsFound, 'checkIsFound');
    // return;
    if (!checkIsFound) {
      dashLogger.error(
        `Error : Not found ${NAME}, Request : ${req.originalUrl}`
      );

      return res.status(400).json({ message: `Not found ${NAME}` });
    }

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

    // console.log(collaborators, 'collaborators');
    // return;
    const linkManagement = await LinkManagementService.update({
      id,
      linkManagement: {
        link_posted,
        keyword,
        category,
        status,
        price_per_word,
        total: parseRounding(
          checkIsFound?.number_words * price_per_word || total
        ),
      },
    });

    const {
      number_words: oldNumberWord,
      domain,
      team,
      brand,
      link_management_ids,
    } = collaborator;
    const newTotal = parseRounding(
      checkIsFound?.number_words * price_per_word || total
    );

    const newCollaborator = {
      number_words: Number(oldNumberWord) + checkIsFound?.number_words,
      total: Number(collaborator?.total - checkIsFound?.total || 0) + newTotal,
    };

    if (linkManagement?._id)
      newCollaborator.link_management_ids = [
        ...(link_management_ids || []),
        linkManagement?._id,
      ];

    const newDomain = {
      total: Number(domain?.total - checkIsFound?.total || 0) + newTotal,
    };
    const newTeam = {
      total: Number(team?.total - checkIsFound?.total || 0) + newTotal,
    };
    const newBrand = {
      total: Number(brand?.total - checkIsFound?.total || 0) + newTotal,
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
    const total = link.total;
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

const exportExcelTeam = async (req, res) => {
  try {
    const { brand, team } = req.query;
    const data = await LinkManagementService.getAllLinkManagementsExcelTeam(
      brand,
      team
    );
    //   let searchObj = {}
    // if (brand) {
    //     searchObj = { roleName: { $regex: '.*' + req.query.search + '.*' } }
    // }
    //   let data = await LinkManagement.find()

    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error.message,
    });
  }
};
const getLinkManagementsByCollaboratorId = async (req, res) => {
  try {
    const { brand, domainId, coladId } = req.query;
    const team = req.query.team;
    const pageSize = Number(req.query?.pageSize) || 10;
    const pageIndex = Number(req.query?.pageIndex) || 1;
    const search = req.query?.search || "";
    const dateFrom =
      req.query.dateFrom !== "undefined"
        ? new Date(req.query.dateFrom)
        : new Date(Date.now() - 30 * 60 * 60 * 24 * 1000);
    const dateTo =
      req.query.dateTo !== "undefined"
        ? new Date(req.query.dateTo)
        : new Date(Date.now());
    const data =
      await LinkManagementService.getAllLinkManagementsByCollaboratorId(
        domainId,
        team,
        brand,
        coladId,
        pageIndex,
        pageSize,
        search,
        dateFrom,
        dateTo
      );

    return res.status(200).json(data);
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getLinkManagementsByDomainId = async (req, res) => {
  try {
    const { domainId } = req.query;

    const pageSize = Number(req.query?.pageSize) || 10;
    const pageIndex = Number(req.query?.pageIndex) || 1;
    const search = req.query?.search || "";
    const listIdLink = [];
    const allCTVByDomain = await Collaborator.find({
      domain_id: domainId,
    }).select("link_management_ids");
    allCTVByDomain?.map((item) => {
      item?.link_management_ids?.map((itemLink) => listIdLink.push(itemLink));
    });
    const result = await LinkManagement.find({
      _id: listIdLink,
      title: {
        $regex: ".*" + search + ".*",
        $options: "i",
      },
    })
      .skip(Number(pageIndex) * Number(pageSize) - Number(pageSize))
      .limit(Number(pageSize));

    return res.status(200).json(result);
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getLinkManagementsByTeamUser = async (req, res) => {
  try {
    const { teamId } = req.query;
    const listDomain = await Domain.find({ team: teamId }).select("_id");
    //xử lý list để lấy list id
    const listIdDomain = listDomain?.map((item) => item?._id);
    const data = await Collaborator.find({
      domain_id: listIdDomain,
    });

    return res.status(200).json(data);
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getLinkManagementsByTeamId = async (req, res) => {
  try {
    const { teamId } = req.query;

    const pageSize = Number(req.query?.pageSize) || 10;
    const pageIndex = Number(req.query?.pageIndex) || 1;
    const search = req.query?.search || "";
    const listDomain = await Domain.find({ team: teamId }).select("_id");
    //xử lý list để lấy list id
    const listIdDomain = listDomain?.map((item) => item?._id);
    const listIdLink = [];
    const allCTVByDomain = await Collaborator.find({
      domain_id: listIdDomain,
    }).select("link_management_ids");
    allCTVByDomain?.map((item) => {
      item?.link_management_ids?.map((itemLink) => listIdLink.push(itemLink));
    });
    const result = await LinkManagement.find({
      _id: listIdLink,
      title: {
        $regex: ".*" + search + ".*",
        $options: "i",
      },
    })
      .skip(Number(pageIndex) * Number(pageSize) - Number(pageSize))
      .limit(Number(pageSize));

    return res.status(200).json(result);
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getLinkManagementsByBrandId = async (req, res) => {
  try {
    const { brandId } = req.query;

    const pageSize = Number(req.query?.pageSize) || 10;
    const pageIndex = Number(req.query?.pageIndex) || 1;
    const search = req.query?.search || "";
    //lấy list team thuộc brand
    const listTeamOfBrand = await Team.find({ brand: brandId }).select("_id");
    const listIdTeam = listTeamOfBrand?.map((item) => item?._id);
    //lấy list domain thuộc team
    const listDomainOfBrand = await Domain.find({ team: listIdTeam }).select(
      "_id"
    );
    //lấy list ctv thuộc domain
    const listIdDomain = listDomainOfBrand?.map((item) => item?._id);
    const listIdLink = [];
    const allCTVByDomain = await Collaborator.find({
      domain_id: listIdDomain,
    }).select("link_management_ids");
    allCTVByDomain?.map((item) => {
      item?.link_management_ids?.map((itemLink) => listIdLink.push(itemLink));
    });
    const result = await LinkManagement.find({
      _id: listIdLink,
      title: {
        $regex: ".*" + search + ".*",
        $options: "i",
      },
    })
      .skip(Number(pageIndex) * Number(pageSize) - Number(pageSize))
      .limit(Number(pageSize));

    return res.status(200).json(result);
  } catch (error) {
    dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getStatisticByBrand = async (req, res) => {
  try {
    const pageSize = Number(req.query?.pageSize) || 10;
    const pageIndex = Number(req.query?.pageIndex) || 1;
    const search = req.query?.search || "";
    const dateFrom = new Date(
      req.query?.dateFrom !== "undefined"
        ? req.query?.dateFrom
        : Date.now() - 30 * 60 * 60 * 24 * 1000
    );
    const dateTo = new Date(
      req.query?.dateTo !== "undefined" ? req.query?.dateTo : Date.now()
    );
    console.log(dateFrom, dateTo);
    const data = await Brand.aggregate([
      {
        $addFields: {
          brandid: "$_id",
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
          let: { brandid: "$brandid" },
          pipeline: [
            {
              $lookup: {
                from: "domains",
                localField: "_id",
                foreignField: "team",
                as: "domains",
                let: { brandid: "$$brandid" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$brand", "$$brandid"] } } },
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
                        {
                          $match: {
                            createdAt: {
                              $gte: new Date(dateFrom?.toISOString()),
                              $lte: new Date(dateTo?.toISOString()),
                            },
                          },
                        },
                      ],
                    },
                  },
                  {
                    $match: {
                      createdAt: {
                        $gte: new Date(dateFrom?.toISOString()),
                        $lte: new Date(dateTo?.toISOString()),
                      },
                    },
                  },
                ],
              },
            },
            {
              $match: {
                createdAt: {
                  $gte: new Date(dateFrom?.toISOString()),
                  $lte: new Date(dateTo?.toISOString()),
                },
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
          createdAt: {
            $gte: new Date(dateFrom?.toISOString()),
            $lte: new Date(dateTo?.toISOString()),
          },
        },
      },
    ]);

    // Promise.all(
    //   data?.map(async (brand) => {
    //     let total = 0;
    //     brand?.team?.map((team) => {
    //       total = total + team?.total;
    //     });
    //     if (brand?.total !== total) {
    //       brand.total = total;
    //       await Brand.findByIdAndUpdate(brand?.id, { total: total });
    //     }
    //   })
    // );

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false });
  }
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
const checkTotal = (parent, children) => {};

module.exports = {
  search,
  create,
  remove,
  update,
  getById,
  getLinkManagementsByCollaboratorId,
  getStatisticByBrand,
  getLinkManagementsByDomainId,
  getLinkManagementsByTeamId,
  getLinkManagementsByBrandId,
  getLinkManagementsByTeamUser,
  createExcel,
  exportExcelTeam,
};
