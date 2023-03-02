const { dashLogger } = require("../logger");
const Team = require("../models/team.model");
const Domain = require("../models/domain.model");
class TeamController {
  async getAll(req, res, next) {
    try {
      const Teams = await Team.find({}).populate("brand");
      return res.status(200).json({
        success: true,
        message: "Success",
        data: Teams,
      });
    } catch (error) {
      dashLogger.error(`Error : ${error}, Request : ${req.originalUrl}`);
      return res.status(400).json({
        message: error.message,
      });
    }
  }
  async create(req, res, next) {
    try {
      const match = await Team.findOne({ name: req.body.name });
      if (match) {
        return res
          .status(400)
          .json({ success: false, message: "Team already exists!" });
      } else {
        const team = new Team(req.body);
        await team.save();
        return res.status(200).json({ success: true, team });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error });
    }
  }
  async update(req, res) {
    console.log(req.body, "body", req.params.id, "id");
    try {
      const id = req.params.id;
      let match = await Team.findById(id);
      if (!match) {
        return res
          .status(400)
          .json({ success: false, message: "Team doesn't exists!" });
      }
      const updateTeam = await Team.findByIdAndUpdate(id, req.body);
      return res.status(200).json({ success: true, data: updateTeam });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error });
    }
  }
  async getById(req, res) {
    try {
      const id = req.params.id;
      let match = await Team.findById(id).populate("brand");
      if (!match) {
        return res
          .status(400)
          .json({ success: false, message: "Team doesn't exists!" });
      }

      return res.status(200).json({ success: true, match });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error });
    }
  }
  async getPaging(req, res) {
    try {
      const pageSize = req.query.pageSize || 10;
      const pageIndex = req.query.pageIndex || 1;
      const search = req.query.search || "";
      const brand = req.query.brand || "";
      const dateFrom =
        req.query.dateFrom !== "undefined"
          ? new Date(req.query.dateFrom)
          : new Date(Date.now() - 30 * 60 * 60 * 24 * 1000);
      const dateTo =
        req.query.dateTo !== "undefined"
          ? new Date(req.query.dateTo)
          : new Date(Date.now());
      let searchQuery = {};
      if (search) {
        // { $regex: ".*" + search + ".*" };
        // searchQuery = { name: { $regex: search, $options: "i" } };
        searchQuery.name = { $regex: ".*" + search + ".*" };
      }
      if (brand) {
        searchQuery.brand = brand;
      }
      if (
        req.query.dateFrom !== "undefined" &&
        req.query.dateTo !== "undefined"
      ) {
        searchQuery.createdAt = { $gte: dateFrom, $lte: dateTo };
      }
      const data = await Team.find(searchQuery)
        .populate("brand")
        .skip(pageSize * pageIndex - pageSize)
        .limit(parseInt(pageSize))
        .sort({
          createdAt: "-1",
        });
      let count = await Team.count();
      const totalPages = Math.ceil(count / pageSize);
      return res.status(200).json({ success: true, data, count, totalPages });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error });
    }
  }
  async delete(req, res) {
    try {
      const id = req.params.id;
      let match = await Team.findById(id);
      if (!match) {
        return res
          .status(400)
          .json({ success: false, message: "Team doesn't exists!" });
      }
      const child = await Domain.find({ team: id });
      if (child.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Team còn domain nên không thể xóa!",
        });
      } else {
        await Team.findByIdAndDelete(id);
        return res.status(200).json({ success: true });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error });
    }
  }
  async getTeamByBrand(req, res) {
    try {
      const pageSize = req.query.pageSize || 10;
      const pageIndex = req.query.pageIndex || 1;
      const brand = req.params.brand || "";
      const search = req.params.search || "";
      const dateFrom =
        req.query.dateFrom !== "undefined"
          ? new Date(req.query.dateFrom)
          : new Date(Date.now() - 30 * 60 * 60 * 24 * 1000);
      const dateTo =
        req.query.dateTo !== "undefined"
          ? new Date(req.query.dateTo)
          : new Date(Date.now());
      let searchQuery = {};
      searchQuery = { brand: brand.toString() };
      if (search) {
        searchQuery.name = { $regex: ".*" + search + ".*" };
      }
      if (
        req.query.dateFrom !== "undefined" &&
        req.query.dateTo !== "undefined"
      ) {
        searchQuery.createdAt = { $gte: dateFrom, $lte: dateTo };
      }

      const data = await Team.find({
        brand: brand.toString(),
      })
        .populate("brand")
        .skip(pageSize * pageIndex - pageSize)
        .limit(parseInt(pageSize))
        .sort({
          createdAt: "-1",
        });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error });
    }
  }
  async getStatisticTeam(req, res) {
    try {
      const id = req.query.id;
      const data = await Team.aggregate([
        {
          $match: {
            id: id !== "undefined" ? id : { $ne: null },
          },
        },
        {
          $lookup: {
            from: "domains",
            localField: "_id",
            foreignField: "team",
            as: "domains",
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
                        as: "linkmanagements",
                        pipeline: [
                          {
                            $lookup: {
                              from: "domains",
                              localField: "domain",
                              foreignField: "_id",
                              as: "domains",
                            },
                          },
                          {
                            $unwind: "$domains",
                          },
                        ],
                      },
                    },
                  ],
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
                $unwind: "$brand",
              },
            ],
          },
        },
      ]);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error });
    }
  }
  async getAll(req, res) {
    try {
      const brand = req.params.brand || "";
      const data = await Team.find().populate("brand");
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error });
    }
  }
}
module.exports = new TeamController();
