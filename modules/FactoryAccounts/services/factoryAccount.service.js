const FactoryAccountModel = require("../model/factoryAccount.model");

// Get Factory Account Log
exports.getFactoryAccountLog = async (req, res) => {
  try {
    const listOfFactoryAccount = await FactoryAccountModel.find({}).populate("ourRequestId");
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: listOfFactoryAccount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};