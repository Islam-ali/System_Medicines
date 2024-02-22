const OurRequest = require("../model/ourRequest.model");
const itemsFactoryModel = require("../../itemsFactory/model/itemsFactory.model");
const convertArray = require("../../../core/shared/errorForm");
const { validationResult } = require("express-validator");
const orderStatusEnum = require("../../../core/enums/OrderStatus.enum");
const stockModel = require("../../stock/model/stock.model");
const PaymentForFactoryModel = require("../../PaymentForFactories/model/paymentForFactories.model");
const FactoryModel = require("../../factory/model/factory.model");
const { json } = require("express");
const branchStock = require("../../branchStock/model/branchStock.model");
class calculate {
  constructor() {}

  totalCost(unitsNumber, unitsCost) {
    return unitsNumber * unitsCost;
  }

  checkNumber(number) {
    return number > 0 ? 1 : number < 0 ? -1 : 0;
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

    const objFactory = await FactoryModel.findOne({
      _id: objItemFactory.factoryId,
    }).populate("typeOfFactoryId");

    const classificationId = objFactory.typeOfFactoryId.classificationId;
    let stock = {};
    if (classificationId == 2) {
      if (body.listOfMaterials.length > 0) {
        for (const material of body.listOfMaterials) {
          stock = await stockModel.findOne({
            itemFactoryId: material.itemFactoryId,
          });
          if (!stock) {
            return res.status(400).json({
              statusCode: res.statusCode,
              message: `The required item is not available in stock`,
            });
          }
          const newUnitsNumber = stock.unitsNumber - material.unitsNumber;
          const checkNumber = new calculate().checkNumber(newUnitsNumber);
          if (checkNumber == -1) {
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
              { itemFactoryId: material.itemFactoryId },
              { $set: { unitsNumber: newUnitsNumber, totalcost: newTotalCost } }
            );
          }
        }
      } else {
        return res.status(400).json({
          statusCode: res.statusCode,
          message: "must be Add row Materials",
        });
      }
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
    const classificationId = req.query.classificationId;
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
        $match: {
          "typeOfFactoryId.classificationId": parseInt(classificationId),
        },
      },
    ]);

    processRequests(ourRequests, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const processRequests = async (listOfOurRequests, res) => {
  let mapResponse = [];
  try {
    for (let i = 0; i < listOfOurRequests.length; i++) {
      const PaymentForFactories = await PaymentForFactoryModel.find({
        ourRequestId: listOfOurRequests[i]._id,
      }).populate({
        path: "ourRequestId",
      });
      listOfOurRequests[i]["listOfPayments"] = PaymentForFactories;
      let objour = JSON.parse(JSON.stringify(listOfOurRequests[i]));
      let obj = {
        ...objour,
        listOfPayments: PaymentForFactories,
      };
      mapResponse.push(obj);
    }

    res.status(200).json({
      statusCode: res.statusCode,
      message: "Successfully fetched data",
      data: mapResponse.reverse(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
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
exports.getOurRequestByFactoryId = async (req, res) => {
  try {
    let listOfOurRequests = await OurRequest.find({
      factoryId: req.params.factoryId,
    })
      .populate({
        path: "itemFactoryId",
        model: "ItemsFactory",
        select: "name",
      })
      .populate({
        path: "factoryId",
        model: "Factory",
        select: "name",
      });

    if (listOfOurRequests.length == 0) {
      return res
        .status(404)
        .json({ message: "Our Requests not found", data: [] });
    }

    processRequests(listOfOurRequests, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
    let stock = {};
    if (classificationId == 2) {
      if (body.listOfMaterials.length > 0) {
        // old stock
        for (const material of objOurRequest.listOfMaterials) {
          stock = await stockModel.findOne({
            itemFactoryId: material.itemFactoryId,
          });
          const newUnitsNumber = stock.unitsNumber + material.unitsNumber;
          const newTotalCost = new calculate().totalCost(
            newUnitsNumber,
            stock.unitsCost
          );
          await stockModel.updateOne(
            { itemFactoryId: material.itemFactoryId },
            { $set: { unitsNumber: newUnitsNumber, totalcost: newTotalCost } }
          );
        }
        // new stock
        for (const material of body.listOfMaterials) {
          stock = await stockModel.findOne({
            itemFactoryId: material.itemFactoryId,
          });
          const newUnitsNumber = stock.unitsNumber - material.unitsNumber;
          const checkNumber = new calculate().checkNumber(newUnitsNumber);
          if (checkNumber == -1) {
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
              { itemFactoryId: material.itemFactoryId },
              { $set: { unitsNumber: newUnitsNumber, totalcost: newTotalCost } }
            );
          }
        }
      } else {
        return res.status(400).json({
          statusCode: res.statusCode,
          message: "must be Add row Materials",
        });
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

    const filter = { _id: req.params.id };
    const updateDocument = {
      $set: { orderStatus: req.body.orderStatus },
    };

    await OurRequest.updateOne(filter, updateDocument);

    // const objFactory = await FactoryModel.findOne({
    //   _id: objItemFactory.factoryId,
    // }).populate("typeOfFactoryId");

    const classificationId =
      objOurRequest.itemFactoryId.factoryId.typeOfFactoryId.classificationId;

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
        patchNumber: "",
        manfDate: "",
        expDate: "",
      });

      // send to Stock if (orderStatus == RECIVED)
      // const objStock = await stockModel.findOne({ourRequestId:objOurRequest._id});
      // if(objStock){
      //   await stockModel.create(stockRequest);
      // }else
      await stockRequest.save();
    }
    if (req.body.orderStatus == orderStatusEnum.RETURN) {
      await stockModel.deleteOne({ ourRequestId: objOurRequest._id }).then(async(result)=>{
        let exist = await branchStock.find({stockId:result._id});
        console.log("cccccc", exist, result);
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
        message: "There is a payment that cannot be deleted",
      });
    }
    // stock = await stockModel.findOne({
    //   ourRequestId: objOurRequest._id,
    // });

    if (objOurRequest.listOfMaterials.length > 0 && false) {
      // old stock
      for (const material of objOurRequest.listOfMaterials) {
        const stockMaterial = await stockModel.findOne({
          itemFactoryId: material.itemFactoryId,
        });
        const newUnitsNumber = stockMaterial.unitsNumber + material.unitsNumber;
        const newTotalCost = new calculate().totalCost(
          newUnitsNumber,
          stockMaterial.unitsCost
        );
        await stockModel.updateOne(
          { itemFactoryId: material.itemFactoryId },
          { $set: { unitsNumber: newUnitsNumber, totalcost: newTotalCost } }
        );
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
