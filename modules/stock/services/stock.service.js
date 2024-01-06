const stockModel = require("../model/stock.model");

// Get Factory Stock
exports.getStock = async (req, res) => {
  try {
    const listOfStock = await stockModel.find({
      classificationId: req.params.classificationId
    }).populate({
      path: "ourRequestId",
      populate: {
        path: "itemFactoryId",
        model: "ItemsFactory",
        select: "name -_id",
      },
    });
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: listOfStock,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateInfoInStock = async (req , res) => {
  try{
    const objStock = await stockModel.findOne({_id:req.params.id});
    if(!objStock){
      return res.status(404).json({ message: "item not found" });
    }

    objStock.patchNumber = req.body.patchNumber
    objStock.manfDate = req.body.manfDate
    objStock.expDate = req.body.expDate

    await objStock.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "update item successfully",
    });
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}