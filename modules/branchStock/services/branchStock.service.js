const branchStockModel = require("../model/branchStock.model");

// Get Factory Stock
exports.getbranchStock = async (req, res) => {
  console.log(req.userId);
  const userId = req.userId;
  try {
    const listOfbranchStock = await branchStockModel
      .find({
        userId: userId,
      })
      .populate({
        path: "userId",
        model: "users",
        select: "_roleId",
      })
      .populate({
        path: "stockId",
        model: "Stock",
      });
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: listOfbranchStock,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// exports.updateInfoInbranchStock = async (req , res) => {
//   try{
//     const objStock = await stockModel.findOne({_id:req.params.id});
//     if(!objStock){
//       return res.status(404).json({ message: "item not found" });
//     }

//     objStock.patchNumber = req.body.patchNumber
//     objStock.manfDate = req.body.manfDate
//     objStock.expDate = req.body.expDate

//     await objStock.save();
//     res.status(201).json({
//       statusCode: res.statusCode,
//       message: "update item successfully",
//     });
//   }catch(error){
//     res.status(500).json({ message: error.message });
//   }
// }
