const branchStockModel = require("../model/branchStock.model");
const userModel = require("../../users/model/user.model");
const StatusSubStock = require("../../../core/enums/StatusSubStock.enum");
// Get Factory Stock
exports.getbranchStock = async (req, res) => {
  const userId = req.query.userId;
  const status = req.query.status;

  let query = {};
  if (userId) {
    query["userId"] = userId;
  }
  if (status) {
    query["status"] = status;
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

exports.getAllBranchStock = async (req, res) => {
  try {
    let newListOfUsersAndCountOfItems = [];
    const ListOfUsers = await userModel
      .find({ roleId: { $ne: "659db7e1e7aef720ff187185" } })
      .select("-password");

    await Promise.all(
      ListOfUsers.map(async (user) => {
        const countOfItems = await branchStockModel.countDocuments({
          userId: user._id,
          status: { $ne: StatusSubStock.OUTOFSTOCK },
        });
        const objUsersAndCountOfItems = {
          user: user,
          countOfItems: countOfItems,
        };
        newListOfUsersAndCountOfItems.push(objUsersAndCountOfItems);
      })
    );
    return res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: newListOfUsersAndCountOfItems,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changeStatusBranchStock = async (req, res) => {
  try {
    const objBranchStock = await branchStockModel.findOne({
      _id: req.params.id,
    });
    if (!objBranchStock) {
      return res.status(404).json({
        message: "Branch stock not found",
      });
    }

    objBranchStock.status = req.body.status;
    objBranchStock.save();
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: objBranchStock,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
