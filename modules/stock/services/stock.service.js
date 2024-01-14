const stockModel = require("../model/stock.model");
const branchStockModel = require("../../branchStock/model/branchStock.model");
const logTransactionStockModel = require("../model/logTransactionStock");

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
    // objStock.pharmacyPrice = pharmacyPrice
    // objStock.publicPrice = publicPrice
    // objStock.totalpharmacyPrice = (objStock.pharmacyPrice * objStock.unitsNumber)
    // objStock.netProfit = (objStock.pharmacyPrice - objStock.unitsCost)
    // objStock.totalNetProfit = (objStock.netProfit * objStock.unitsNumber)


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
  const {stockId,unitsNumber,userId , date , pharmacyPrice , publicPrice} = req.body
  if( !stockId || !unitsNumber || !userId  || !date  || !pharmacyPrice  || !publicPrice){
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
    newBranchStock.pharmacyPrice = pharmacyPrice;
    newBranchStock.publicPrice = publicPrice;
    newBranchStock.unitsNumber = unitsNumber;
    newBranchStock.totalpharmacyPrice = (pharmacyPrice * unitsNumber)
    newBranchStock.date = date;

    
    
    // creta log transAction Stock
    const newLogTransactionStock = Object.assign({} , newBranchStock);
    newLogTransactionStock.netProfit = (pharmacyPrice - objStock.unitsCost)
    newLogTransactionStock.totalNetProfit = (newLogTransactionStock.netProfit * unitsNumber)
    
    // update stock
    objStock.unitsNumber = objStock.unitsNumber - unitsNumber;
    objStock.totalcost = (objStock.unitsNumber * objStock.unitsCost);
    
    await branchStockModel.create(newBranchStock);
    await logTransactionStockModel.create(newLogTransactionStock);
    await objStock.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "transaction successfully",
    });
    
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}