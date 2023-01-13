const { dashLogger } = require("../logger");
const Team = require("../models/team.model");

class TeamController {
  async create(req, res, next) {
    try {
      console.log(req.body);
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
    try {
      const id = req.params.id;
      let match = await Team.findById(id);
      if (!match) {
        return res
          .status(400)
          .json({ success: false, message: "Team doesn't exists!" });
      }
      const updateTeam = await Team.findByIdAndUpdate(id, req.body);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error });
    }
  }
  async getById(req, res) {
    try {
      const id = req.params.id;
      let match = await Team.findById(id).populate('brand');
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
      const pageSize = req.params.pageSize || 10;
      const pageIndex = req.params.pageIndex || 1;
      const search = req.params.search || "";
      let searchQuery = {};
      if (search) {
        searchQuery = { name: { $regex: search, $options: "i" } };
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
}
module.exports = new TeamController();
