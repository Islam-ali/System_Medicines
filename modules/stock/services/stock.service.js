const stockModel = require("../model/stock.model");
const branchStockModel = require("../../branchStock/model/branchStock.model");

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
  const {patchNumber,manfDate,expDate,pharmacyPrice , publicPrice} = req.body
  if( !patchNumber|| !manfDate|| !expDate|| !pharmacyPrice){
    return res.status(400).json({ message: "invalid Data" });
  }
  try{
    const objStock = await stockModel.findOne({_id:req.params.id});
    if(!objStock){
      return res.status(404).json({ message: "Stock not found" });
    }

    objStock.patchNumber = patchNumber
    objStock.manfDate = manfDate
    objStock.expDate = expDate

    await objStock.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "update item successfully",
    });
    
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}


exports.transactionToBranchStock = async (req , res) => {
  const {stockId,unitsNumber,userId , date , publicPrice} = req.body
  if( !stockId || !unitsNumber || !userId  || !date  || !publicPrice){
    return res.status(400).json({ message: "invalid Data" });
  }
  try{
    const objStock = await stockModel.findOne({_id:stockId});
    if(!objStock){
      return res.status(404).json({ message: "Stock not found" });
    }
  
    // create new branch stock
    const newBranchStock = {};
    newBranchStock.stockId = stockId;
    newBranchStock.userId = userId;
    newBranchStock.publicPrice = publicPrice;
    newBranchStock.unitsNumber = unitsNumber;
    newBranchStock.date = date;

    // update stock
    objStock.unitsNumber = objStock.unitsNumber - unitsNumber;
    objStock.totalcost = (objStock.unitsNumber * objStock.unitsCost);
    
    await branchStockModel.create(newBranchStock);
    await objStock.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "transaction successfully",
    });
    
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}