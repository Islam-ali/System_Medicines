const branchStockModel = require("../model/branchStock.model");
const userModel = require("../../users/model/user.model")
// Get Factory Stock
exports.getbranchStock = async (req, res) => {
  const userId = req.query.userId;
  // const isAllow = req.roleName == 'Admin';

  let query = {};
  if (userId) {
    query = { userId: userId };
  }
  try {
    const listOfbranchStock = await branchStockModel
      .find(query)
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

exports.getAllBranchStock = async (req , res) => {
  try{
    let newListOfUsersAndCountOfItems = [];
    const ListOfUsers = await userModel.find({ roleId: { $ne: '659db7e1e7aef720ff187185' } }).select('-password');
    
    await Promise.all(ListOfUsers.map(async (user) => {
      const countOfItems = await branchStockModel.countDocuments({ userId: user._id });
      const objUsersAndCountOfItems = {
        user: user,
        countOfItems: countOfItems,
      };
      newListOfUsersAndCountOfItems.push(objUsersAndCountOfItems);
    }));
   return res.status(200).json({      
    statusCode: res.statusCode,
    message: "successfully",
    data: newListOfUsersAndCountOfItems });

  }catch(error){
    res.status(500).json({ message: error.message });
  }
}
