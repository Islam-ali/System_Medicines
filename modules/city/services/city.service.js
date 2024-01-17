const cityModel = require("../model/city.model");
const { validationResult } = require("express-validator");
const convertArray = require("../../../core/shared/errorForm");

// get All type of Factories
exports.getAllCity = async (req, res, next) => {
  try {
    const allCity = await cityModel.find().populate("governmentId");
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: allCity,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};


exports.getCityByGovernmentId = async (req, res) => {
  try {
    const listOfCity = await cityModel.find({
      governmentId: req.params.governmentId,
    }).populate("governmentId");
    if (!listOfCity) {
      return res
        .status(404)
        .json({statusCode: res.statusCode, message: "Government not Result", data: listOfCity });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: listOfCity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// create City
exports.createCity = async (req, res, next) => {
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
    const existingCity = await cityModel.findOne({
      name: req.body.name,
    });
    if (existingCity) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "name already exists",
      });
    }

    const newCity = new cityModel(req.body);
    await newCity.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "created City successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// update City
exports.updateCity = async (req, res, next) => {
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
    const exist = await cityModel.findOne({
      _id: req.params.id,
    });
    if (!exist) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "not exist City",
      });
    }
    const filterexist = {name:req.body.name , _id:{ $ne:req.params.id}}
    const existingname = await cityModel.findOne(filterexist);
    if (existingname) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "name already exists",
      });
    }
    const filter = { _id: req.params.id };
    const updateDocument = {
      $set: req.body,
    };
    await cityModel.updateOne(filter, updateDocument);
    res.status(201).json({
      statusCode: res.statusCode,
      message: "updated City successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// Delete City
exports.deleteCity = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const existingType = await cityModel.findOne(filter);
    if (!existingType) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found City",
      });
    }
    await cityModel.deleteOne(filter);
    res.status(201).json({
      statusCode: res.statusCode,
      message: "deleted City successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};
