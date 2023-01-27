const { dashLogger } = require("../logger");
const Team = require("../models/team.model");

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
      let searchQuery = {};
      if (search) {
        // { $regex: ".*" + search + ".*" };
        searchQuery = { name: { $regex: search, $options: "i" } };
        // searchQuery.name = { $regex: ".*" + search + ".*" };
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
      await Team.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error });
    }
  }
  async getTeamByBrand(req, res) {
    try {
      const brand = req.params.brand || "";
      const data = await Team.find({
        brand: brand.toString(),
      }).populate("brand");
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
