const wayOfPaymentModel = require("../model/wayOfPayment.model");
// const convertArray = require("../../../core/shared/errorForm");
// const { validationResult } = require("express-validator");

// Create a new wayOfPayment
exports.createwayOfPayment = async (req, res) => {
  try {
    const existingwayOfPayment = await wayOfPaymentModel.findOne({
      name: req.body.name,
    });
    if (existingwayOfPayment) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "wayOfPayment already exists",
      });
    }
    await wayOfPaymentModel.create(req.body);
    return res.status(201).json({
      statusCode: res.statusCode,
      message: "create Payment way successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all PaymentWay
exports.getAllPaymentWay = async (req, res) => {
  try {
    const PaymentWay = await wayOfPaymentModel.find();
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: PaymentWay,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific wayOfPayment by ID
exports.getwayOfPaymentById = async (req, res) => {
  try {
    const wayOfPayment = await wayOfPaymentModel.findById(req.params.id);
    if (!wayOfPayment) {
      return res.status(404).json({ message: "Payment way not found" });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: wayOfPayment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update a wayOfPayment by ID
exports.updatewayOfPayment = async (req, res) => {
  try {
    let wayOfPaymentToUpdate = await wayOfPaymentModel.findOne({
      _id: req.params.id,
    });
    if (!wayOfPaymentToUpdate) {
      return res.status(404).json({
        message: "Payment way not found",
        data: [],
      });
    }
    wayOfPaymentToUpdate.name = req.body.name;
    await wayOfPaymentToUpdate.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "update Payment way successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a wayOfPayment by ID
exports.deletewayOfPayment = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const existingType = await wayOfPaymentModel.findOne(filter);
    if (!existingType) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found Payment way",
      });
    }
    await wayOfPaymentModel.deleteOne(filter);
    res.status(201).json({
      statusCode: res.statusCode,
      message: "delete Payment way successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
