const typeOfFactoryModel = require("../model/typeOfFactory.model");
const { validationResult } = require("express-validator");
const convertArray = require("../../../core/shared/errorForm");

// get All type of Factories
exports.getTypeOfFactories = async (req, res, next) => {
  try {
    const allTypeOfFactory = await typeOfFactoryModel.find({});
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: allTypeOfFactory,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// get list of types Factory
exports.getListOfTypesFactoryByClassificationId = async (req, res) => {
  try {
    const ListOfTypesFactory = await typeOfFactoryModel.find({
      classificationId: req.params.id,
    });
    if (!ListOfTypesFactory) {
      return res
        .status(404)
        .json({ message: "types of Factories not found", data: ListOfTypesFactory });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: ListOfTypesFactory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// create type of Factory
exports.createTypeOfFactory = async (req, res, next) => {
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
    const existingType = await typeOfFactoryModel.findOne({
      type: req.body.type,
    });
    if (existingType) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "type already exists",
      });
    }

    const newtypeOfFactory = new typeOfFactoryModel(req.body);
    await newtypeOfFactory.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "created type Of Factory successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// update type of Factory
exports.updateTypeOfFactory = async (req, res, next) => {
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
    const exist = await typeOfFactoryModel.findOne({
      _id: req.params.id,
    });
    if (!exist) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "not exist type of factory",
      });
    }
    const filterexist = {type:req.body.type , _id:{ $ne:req.params.id}}
    const existingType = await typeOfFactoryModel.findOne(filterexist);
    if (existingType) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "type already exists",
      });
    }
    const filter = { _id: req.params.id };
    const updateDocument = {
      $set: req.body,
    };
    await typeOfFactoryModel.updateOne(filter, updateDocument);
    res.status(201).json({
      statusCode: res.statusCode,
      message: "updated type Of Factory successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// Delete Type Of Factory
exports.deleteTypeOfFactory = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const existingType = await typeOfFactoryModel.findOne(filter);
    if (!existingType) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found type Of Factory",
      });
    }
    await typeOfFactoryModel.deleteOne(filter);
    res.status(201).json({
      statusCode: res.statusCode,
      message: "deleted type Of Factory successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};
