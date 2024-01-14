const logTransactionStockModel = require("../model/logTransactionStock");




// Get Factory Stock
exports.getLogTransactionStock = async (req, res) => {
  try {
    const listOfLogTransactionStock = await logTransactionStockModel.find();
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: listOfLogTransactionStock,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};