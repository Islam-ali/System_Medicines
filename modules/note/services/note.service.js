const { validationResult } = require("express-validator");
const convertArray = require("../../../core/shared/errorForm");
const noteModel = require("../model/note.model");

// get All type of Factories
exports.getAllnote = async (req, res, next) => {
  try {
    const allnote = await noteModel.find();
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: allnote,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// create note
exports.createnote = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const convArray = new convertArray(errors.array());
    return res.status(400).json({
      statusCode: res.statusCode,
      message: "invalid Error",
      errors: convArray.errorForm(),
    });
  }
  try {
    // const existingnote = await noteModel.findOne();
    // if (existingnote) {
    //   return res.status(400).json({
    //     statusCode: res.statusCode,
    //     message: "name already exists",
    //   });
    // }

    const newnote = new noteModel({
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
    });
    await newnote.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "created note successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// update note
exports.updatenote = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const convArray = new convertArray(errors.array());
    return res.status(400).json({
      statusCode: res.statusCode,
      message: "invalid Error",
      errors: convArray.errorForm(),
    });
  }
  try {
    const objnote = await noteModel.findOne({
      _id: req.params.id,
    });
    if (!objnote) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "not exist note",
      });
    }

    (objnote.title = req.body.title),
    (objnote.description = req.body.description),
    (objnote.date = req.body.date),
    await objnote.save();

    res.status(201).json({
      statusCode: res.statusCode,
      message: "updated note successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// Delete note
exports.deletenote = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const existingType = await noteModel.findOne(filter);
    if (!existingType) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found note",
      });
    }
    await noteModel.deleteOne(filter);
    res.status(201).json({
      statusCode: res.statusCode,
      message: "deleted note successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};
