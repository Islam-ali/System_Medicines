const OurRequest = require("../model/ourRequest.model");
const itemsFactoryModel = require("../../itemsFactory/model/itemsFactory.model");
const convertArray = require("../../../core/shared/errorForm");
const { validationResult } = require("express-validator");
const orderStatusEnum = require("../../../core/enums/OrderStatus.enum");
const stockModel = require("../../stock/model/stock.model");
const PaymentForFactoryModel = require("../../PaymentForFactories/model/paymentForFactories.model");
const FactoryModel = require("../../factory/model/factory.model");
const logStock = require("../../stock/model/logStock.model");
const mongoose = require("mongoose");

class calculate {
  constructor() {}

  totalCost(unitsNumber, unitsCost) {
    return unitsNumber * unitsCost;
  }
}
// Create a new OurRequest
exports.createOurRequest = async (req, res) => {
  var body = Object.assign({}, req.body);
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
    // return res.json(body);
    const objItemFactory = await itemsFactoryModel.findOne({
      _id: body.itemFactoryId,
    });
    if (!objItemFactory) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "not exist item Factory",
      });
    }
    body["factoryId"] = objItemFactory.factoryId;
    body["totalcost"] = new calculate().totalCost(
      body.unitsNumber,
      body.unitsCost
    );
    body["balance"] = body.totalcost;

    const objFactory = await FactoryModel.findOne({
      _id: objItemFactory.factoryId,
    }).populate("typeOfFactoryId");

    const classificationId = objFactory.typeOfFactoryId.classificationId;
    let stock = {};
    if (classificationId == 2) {
      if (body.listOfMaterials.length > 0) {
        body.listOfMaterials.forEach(async (material, index) => {
          material._id = new mongoose.Types.ObjectId();
          stock = await stockModel.findOne({
            _id: material.itemFactoryId,
          });
          if (!stock) {
            return res.status(400).json({
              statusCode: res.statusCode,
              message: `The required item is not available in stock`,
            });
          }
          const newUnitsNumber = stock.unitsNumber - material.unitsNumber;
          if (newUnitsNumber < 0) {
            return res.status(400).json({
              statusCode: res.statusCode,
              message: `The required number of units in the ${stock.itemName} is not available in stock`,
            });
          } else {
            const newTotalCost = new calculate().totalCost(
              newUnitsNumber,
              stock.unitsCost
            );
            await stockModel.updateOne(
              { _id: material.itemFactoryId },
              { $set: { unitsNumber: newUnitsNumber, totalcost: newTotalCost } }
            );
          }
        });
      }
      // else {
      //   return res.status(400).json({
      //     statusCode: res.statusCode,
      //     message: "must be Add row Materials",
      //   });
      // }
    }

    const mapBody = {
      ...body,
      itemName: objItemFactory.name,
    };
    await OurRequest.create(mapBody);
    return res.status(201).json({
      statusCode: res.statusCode,
      message: "create Our Request successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Our Request
exports.getAllOurRequests = async (req, res) => {
  try {
    let query = {};
    const classificationId = req.query.classificationId;
    const factoryId = req.query.factoryId;
    if (classificationId) {
      query["typeOfFactoryId.classificationId"] = parseInt(classificationId);
    }
    if (factoryId) {
      query["factoryId._id"] = new mongoose.Types.ObjectId(req.query.factoryId);
    }
    console.log(query);
    const ourRequests = await OurRequest.aggregate([
      {
        $lookup: {
          from: "factories",
          localField: "factoryId",
          foreignField: "_id",
          as: "factoryId",
        },
      },
      { $unwind: "$factoryId" },
      {
        $lookup: {
          from: "typeoffactories",
          localField: "factoryId.typeOfFactoryId",
          foreignField: "_id",
          as: "typeOfFactoryId",
        },
      },
      { $unwind: "$typeOfFactoryId" },
      {
        $match: query,
      },
    ]);

    // Iterate through each OurRequest document
    for (const request of ourRequests) {
      // Find all PaymentForFactory documents associated with the current OurRequest
      const payments = await PaymentForFactoryModel.find({
        ourRequestId: request._id,
      }).lean();
      // Add the found payments to the current OurRequest document
      request.listOfPayments = payments;
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: ourRequests.reverse(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const processRequests = async (listOfOurRequests, res) => {
//   let mapResponse = [];
//   try {
//     for (let i = 0; i < listOfOurRequests.length; i++) {
//       const PaymentForFactories = await PaymentForFactoryModel.find({
//         ourRequestId: listOfOurRequests[i]._id,
//       }).populate({
//         path: "ourRequestId",
//       });
//       listOfOurRequests[i]["listOfPayments"] = PaymentForFactories;
//       let objour = JSON.parse(JSON.stringify(listOfOurRequests[i]));
//       let obj = {
//         ...objour,
//         listOfPayments: PaymentForFactories,
//       };
//       mapResponse.push(obj);
//     }

//     res.status(200).json({
//       statusCode: res.statusCode,
//       message: "Successfully fetched data",
//       data: mapResponse.reverse(),
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// Get Our Request by ID
exports.getOurRequestById = async (req, res) => {
  try {
    const objOurRequest = await OurRequest.findById(req.params.id).populate(
      "itemFactoryId"
    );
    if (!objOurRequest) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: objOurRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Our Request by factoryId
// exports.getOurRequestByFactoryId = async (req, res) => {
//   try {
//     let listOfOurRequests = await OurRequest.find({
//       factoryId: req.params.factoryId,
//     })
//       .populate({
//         path: "itemFactoryId",
//         model: "ItemsFactory",
//         select: "name",
//       })
//       .populate({
//         path: "factoryId",
//         model: "Factory",
//         select: "name",
//       });

//     if (listOfOurRequests.length == 0) {
//       return res
//         .status(404)
//         .json({ message: "Our Requests not found", data: [] });
//     }

//     processRequests(listOfOurRequests, res);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Get Our Request by factoryId
exports.getOueRequestByItemsFactoryId = async (req, res) => {
  try {
    const listOfOurRequests = await OurRequest.find({
      itemFactoryId: req.params.itemsFactoryId,
    }).populate({
      path: "itemFactoryId",
      populate: {
        path: "factoryId",
        model: "Factory",
        select: "name",
      },
    });
    if (!listOfOurRequests) {
      return res
        .status(404)
        .json({ message: "Our Requests not found", data: [] });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: listOfOurRequests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update a factory by ID
exports.updateOurRequest = async (req, res) => {
  const errors = validationResult(req);
  if (!req.params.id) {
    return res.status(400).json({
      statusCode: res.statusCode,
      message: "ID Is Requierd",
    });
  }
  if (!errors.isEmpty()) {
    const convArray = new convertArray(errors.array());
    return res.status(400).json({
      statusCode: res.statusCode,
      message: "invalid Error",
      errors: convArray.errorForm(),
    });
  }
  try {
    let objOurRequest = await OurRequest.findOne({
      _id: req.params.id,
    });
    if (!objOurRequest) {
      return res.status(404).json({
        message: "Our Request not found",
        data: [],
      });
    }
    if (objOurRequest.orderStatus == orderStatusEnum.RECIVED) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "can't update when is Recived",
      });
    }
    const objItemFactory = await itemsFactoryModel.findOne({
      _id: req.body.itemFactoryId,
    });
    if (!objItemFactory) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "Item not exists",
      });
    }

    req.body["totalcost"] = new calculate().totalCost(
      req.body.unitsNumber,
      req.body.unitsCost
    );

    const objFactory = await FactoryModel.findOne({
      _id: objItemFactory.factoryId,
    }).populate("typeOfFactoryId");

    const classificationId = objFactory.typeOfFactoryId.classificationId;
    // let stock = {};
    if (classificationId == 2) {
      if (req.body.listOfMaterials.length > 0) {
        // old stock
        for (const material of objOurRequest.listOfMaterials) {
          const stock = await stockModel.findOne({
            _id: material.itemFactoryId,
          });
          const newUnitsNumber = stock.unitsNumber + material.unitsNumber;
          const newTotalCost = new calculate().totalCost(
            newUnitsNumber,
            stock.unitsCost
          );

          stock.unitsNumber = newUnitsNumber;
          stock.totalcost = newTotalCost;
          await stock.save();
        }
        // new stock
        for (const material of req.body.listOfMaterials) {
          const stock = await stockModel.findOne({
            _id: material.itemFactoryId,
          });
          !material._id ? (material._id = new mongoose.Types.ObjectId()) : null;
          const newUnitsNumber = stock.unitsNumber - material.unitsNumber;
          if (newUnitsNumber < 0) {
            return res.status(400).json({
              statusCode: res.statusCode,
              message: `The required number of units in the ${stock.itemName} is not available in stock`,
            });
          } else {
            const newTotalCost = new calculate().totalCost(
              newUnitsNumber,
              stock.unitsCost
            );
            stock.unitsNumber = newUnitsNumber;
            stock.totalcost = newTotalCost;
            await stock.save();
          }
        }
      }
    }

    const filter = { _id: req.params.id };
    const updateDocument = {
      $set: req.body,
    };

    await OurRequest.updateOne(filter, updateDocument);
    res.status(201).json({
      statusCode: res.statusCode,
      message: "update Our Request successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update change orderStatus
exports.changeOrderStatus = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({
      statusCode: res.statusCode,
      message: "ID Is Requierd",
    });
  }
  try {
    let objOurRequest = await OurRequest.findOne({
      _id: req.params.id,
    }).populate({
      path: "itemFactoryId",
      populate: {
        path: "factoryId",
        model: "Factory",
        select: "name -_id",
        populate: {
          path: "typeOfFactoryId",
          model: "typeOfFactory",
        },
      },
    });
    if (!objOurRequest) {
      return res.status(404).json({
        message: "Our Request not found",
        data: [],
      });
    }
    const classificationId =
    objOurRequest.itemFactoryId.factoryId.typeOfFactoryId.classificationId;
    if (
      classificationId == 2 &&
      (!objOurRequest.patchNumber ||
      !objOurRequest.manfDate ||
      !objOurRequest.expDate)
    ) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "must be Add PatchNumber , ManfDate and ExpDate",
      });
    }

    if (req.body.orderStatus == orderStatusEnum.RECIVED) {
      const stockRequest = new stockModel({
        classificationId: classificationId,
        ourRequestId: objOurRequest._id,
        itemName: objOurRequest.itemName,
        itemFactoryId: objOurRequest.itemFactoryId._id,
        typeofFactory:
          objOurRequest.itemFactoryId.factoryId.typeOfFactoryId.type,
        unitsNumber: objOurRequest.unitsNumber,
        unitsCost: objOurRequest.unitsCost,
        totalcost: objOurRequest.totalcost,
        patchNumber: objOurRequest.patchNumber,
        manfDate: objOurRequest.manfDate,
        expDate: objOurRequest.expDate,
      });

      const filter = { _id: req.params.id };
      const updateDocument = {
        $set: { orderStatus: req.body.orderStatus },
      };

      await OurRequest.updateOne(filter, updateDocument);
      await stockRequest.save().then(async (result) => {
        const objLogStock = new logStock({
          itemName: objOurRequest.itemName,
          factoryName: objOurRequest.itemFactoryId.factoryId.name,
          unitsNumber: objOurRequest.unitsNumber,
          unitsCost: objOurRequest.unitsCost,
          totalcost: objOurRequest.totalcost,
          orderStatus: orderStatusEnum.RECIVED,
          insertDate: new Date(),
        });
        await objLogStock.save();
      });
    }

    res.status(201).json({
      statusCode: res.statusCode,
      message: "update Our Request successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a factory by ID
exports.deleteOurRequest = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const objOurRequest = await OurRequest.findOne(filter);
    if (!objOurRequest) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found Item",
      });
    }
    const listPaymentForFactory = await PaymentForFactoryModel.find({
      ourRequestId: req.params.id,
    });
    if (listPaymentForFactory.length > 0) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "There is a OurRequest that cannot be deleted",
      });
    }
    const objStockModel = await stockModel.findOne({
      ourRequestId: req.params.id,
    });
    if (objStockModel) {
      if (objOurRequest.unitsNumber !== objStockModel.unitsNumber) {
        return res.status(400).json({
          statusCode: res.statusCode,
          message:
            "There is a units Number in OurRequest Not Equal units Number in Stock",
        });
      }
    }

    // if(objStockModel){
    //   const objBranchStockModel = await branchStockModel.findOne({
    //     stockId: objStockModel._id,
    //   });
    //   if(objBranchStockModel){
    //     return res.status(400).json({
    //       statusCode: res.statusCode,
    //       message: "There is a OurRequest that cannot be deleted",
    //     });
    //   }
    // }
    // stock = await stockModel.findOne({
    //   ourRequestId: objOurRequest._id,
    // });

    if (objOurRequest.listOfMaterials.length > 0) {
      // old stock
      for (const material of objOurRequest.listOfMaterials) {
        const stockMaterial = await stockModel.findOne({
          _id: material.itemFactoryId,
        });
        const newUnitsNumber = stockMaterial.unitsNumber + material.unitsNumber;
        const newTotalCost = new calculate().totalCost(
          newUnitsNumber,
          stockMaterial.unitsCost
        );
        stockMaterial.unitsNumber = newUnitsNumber;
        stockMaterial.totalcost = newTotalCost;
        await stockMaterial.save();
      }
    }
    // return res.json({stock})
    // // const newUnitsNumber = stock.unitsNumber - objOurRequest.unitsNumber;
    // // const newTotalCost = new calculate().totalCost(
    // //   newUnitsNumber,
    // //   stock.unitsCost
    // // );
    await stockModel.deleteOne({ ourRequestId: objOurRequest._id });
    // await stockModel.updateOne(
    //   { itemFactoryId: objOurRequest.itemFactoryId },
    //   { $set: { unitsNumber: newUnitsNumber, totalcost: newTotalCost } }
    // );
    await OurRequest.deleteOne(filter);
    res.status(201).json({
      statusCode: res.statusCode,
      message: "delete Our Request successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteItemMaterials = async (req, res) => {
  try {
    const body = req.body;
    const filter = { _id: req.params.id };
    const objOurRequest = await OurRequest.findOne(filter);
    if (!objOurRequest) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found Item",
      });
    }

    const stockMaterial = await stockModel.findOne({
      _id: body.itemFactoryId,
    });
    const newUnitsNumber = stockMaterial.unitsNumber + body.unitsNumber;
    const newTotalCost = new calculate().totalCost(
      newUnitsNumber,
      stockMaterial.unitsCost
    );
    stockMaterial.unitsNumber = newUnitsNumber;
    stockMaterial.totalcost = newTotalCost;
    await stockMaterial.save();

    let indexOfMaterial = objOurRequest.listOfMaterials.findIndex(
      (x) =>
        new mongoose.Types.ObjectId(x._id) ==
        new mongoose.Types.ObjectId(body.id)
    );
    objOurRequest.listOfMaterials.splice(indexOfMaterial, 1);
    await objOurRequest.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
