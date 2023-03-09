const ResponseModel = require("../helpers/ResponseModel");
const OrderPostsModel = require("../models/orderPost.model");
const countWord = async (req, res) => {
  // console.log(`sdfsha`, req.body);
  const { _id, minWord } = req.body;
  let response = "";
  try {
    const link_post = req.body.link;
    const googleDoc = require("../helpers/google.doc");
    const parseNumberOfWord = require("../helpers/parseNumberOfWord");

    const link_id = link_post.substring(
      link_post.lastIndexOf("/d/") + 3,
      link_post.indexOf("/edit")
    );

    const doc = await googleDoc.printDoc(link_id);
    const { title, body, inlineObjects } = doc?.data;
    const { number_image, number_word } = await parseNumberOfWord(
      body,
      inlineObjects
    );
    if (number_word >= minWord) {
      const rs = await OrderPostsModel.findByIdAndUpdate(
        _id,
        { $set: { link: link_post, statusOrderPost: 1 } },
        { new: true }
      );
      // console.log("rs: ", rs);
      response = new ResponseModel(200, `Thành công`, rs);
      res.status(200).json(response);
    } else {
      await OrderPostsModel.findByIdAndUpdate(
        _id,
        { $set: { link: link_post } },
        { new: true }
      );
      response = new ResponseModel(200, `${number_word}/${minWord}`, {});
      res.status(200).json(response);
    }
    // console.log("number_word: ", number_word);
    // console.log("number_image: ", number_image);
  } catch (error) {
    response = new ResponseModel(200, "Lỗi server", []);
    res.status(500).json(response);
  }
};

module.exports = { countWord };
