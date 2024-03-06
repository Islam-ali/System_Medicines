const { validationResult } = require("express-validator");
const convertArray = require("../../../core/shared/errorForm");
const doctorModel = require("../model/doctor.model");

// get All type of Factories
exports.getAllDoctor = async (req, res, next) => {
  try {
    const allDoctor = await doctorModel.find().populate({
      path: "cityId",
      model: "city",
      populate: {
        path: "governmentId",
        model: "government",
      },
    });
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: allDoctor,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// create Doctor
exports.createDoctor = async (req, res, next) => {
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
    const existingDoctor = await doctorModel.findOne({
      name: req.body.name,
    });
    if (existingDoctor) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "name already exists",
      });
    }

    const newDoctor = new doctorModel({
      name: req.body.name,
      specialist: req.body.specialist,
      cityId: req.body.cityId,
    });
    await newDoctor.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "created Doctor successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// update Doctor
exports.updateDoctor = async (req, res, next) => {
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
    const objDoctor = await doctorModel.findOne({
      _id: req.params.id,
    });
    if (!objDoctor) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "not exist Doctor",
      });
    }
    const filterexist = { name: req.body.name, _id: { $ne: req.params.id } };
    const existingname = await doctorModel.findOne(filterexist);
    if (existingname) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "name already exists",
      });
    }

    (objDoctor.name = req.body.name),
      (objDoctor.cityId = req.body.cityId),
      (objDoctor.specialist = req.body.specialist),
      await objDoctor.save();

    res.status(201).json({
      statusCode: res.statusCode,
      message: "updated Doctor successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// Delete Doctor
exports.deleteDoctor = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const existingType = await doctorModel.findOne(filter);
    if (!existingType) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found Doctor",
      });
    }
    await doctorModel.deleteOne(filter);
    res.status(201).json({
      statusCode: res.statusCode,
      message: "deleted Doctor successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};
