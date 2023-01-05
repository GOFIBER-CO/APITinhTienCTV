const FP = require("../models/fp.model");
const { isValidObjectId } = require("mongoose");

async function createFP(req, res) {
  try {
    const { visitorId } = req.body;

    const checkExist = await FP.findOne({ visitorId });

    if (checkExist) {
      return res.status(200).json({ success: true, status: 1 });
    }

    let fp = new FP(req.body);
    fp.createdAt = Date.now();

    // console.log(fp);

    let newFP = await fp.save();

    res.status(200).json({ success: true, newFP, status: 1 });
  } catch (error) {
    res.status(500).json(error);
  }
}

async function updateFP(req, res) {
  try {
    let newFP = {
      updatedTime: Date.now(),
      ...req.body,
    };
    let updatedFP = await FP.findOneAndUpdate({ _id: req.params.id }, newFP);
    if (!updatedFP) {
      res
        .status(400)
        .json({ success: false, message: "Missing field", status: 0 });
    } else {
      res.status(200).json({ success: true, newFP, status: 1 });
    }
  } catch (error) {
    res.status(500).json({ success: false, error, status: 0 });
  }
}

async function deleteFP(req, res) {
  if (isValidObjectId(req.params.id)) {
    try {
      let fp = await FP.findByIdAndDelete(req.params.id);
      return res.status(200).json({ success: true, message: "Delete success" });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  } else {
    res.status(404).json(new ResponseModel(404, "FPId is not valid!", null));
  }
}

async function getPagingFP(req, res) {
  let pageSize = req.query.pageSize || 10;
  let pageIndex = req.query.pageIndex || 1;

  let searchObj = {};
  if (req.query.search) {
    searchObj = { visitorId: { $regex: ".*" + req.query.search + ".*" } };
  }
  try {
    let fps = await FP.find(searchObj)
      .skip(pageSize * pageIndex - pageSize)
      .limit(parseInt(pageSize))
      .sort({
        createdTime: "desc",
      });

    let count = await FP.find(searchObj).countDocuments();

    let pagedModel = {
      pageIndex,
      pageSize,
      totalPages: count,
      fps,
    };

    res.json(pagedModel);
  } catch (error) {
    let response = new ResponseModel(404, error.message, error);
    res.status(500).json(response);
  }
}

async function getFPById(req, res) {
  if (isValidObjectId(req.params.id)) {
    try {
      let fp = await FP.findById(req.params.id);
      res.json(fp);
    } catch (error) {
      res.status(500).json(500, error.message, error);
    }
  } else {
    res.status(404).json(new ResponseModel(404, "FPId is not valid!", null));
  }
}

exports.createFP = createFP;
exports.updateFP = updateFP;
exports.deleteFP = deleteFP;
exports.getPagingFP = getPagingFP;
exports.getFPById = getFPById;
