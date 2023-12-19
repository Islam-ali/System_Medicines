const OurRequest = require("../model/ourRequest.model");
const itemsFactoryModel = require("../../itemsFactory/model/itemsFactory.model");
const convertArray = require("../../../core/shared/errorForm");
const { validationResult } = require("express-validator");
const orderStatusEnum = require("../../../core/enums/OrderStatus.enum");
const stockModel = require("../../stock/model/stock.model");

class calculate {
  constructor(unitsNumber, unitsCost) {
    this.unitsNumber = unitsNumber;
    this.unitsCost = unitsCost;
  }

  totalCost() {
    return this.unitsNumber * this.unitsCost;
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

    body["totalcost"] = new calculate(
      body.unitsNumber,
      body.unitsCost
    ).totalCost();

    await OurRequest.create(body);
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
    const ourRequests = await OurRequest.find({}).populate("itemFactoryId");
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: ourRequests,
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
    const objFactory = await OurRequest.findOne({
      factoryId: req.params.factoryId,
    });
    if (!objFactory) {
      return res.status(404).json({ message: "Item not found", data: null });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: objFactory,
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
      _id: req.body.id,
    });
    if (!objOurRequest) {
      return res.status(404).json({
        message: "Our Request not found",
        data: [],
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

    req.body["totalcost"] = new calculate(
      req.body.unitsNumber,
      req.body.unitsCost
    ).totalCost();

    const filter = { _id: req.body.id };
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
          select: "type -_id",
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

    const stockRequest = {
      ourRequestId: objOurRequest._id,
      itemName: objOurRequest.itemFactoryId.name,
      typeofFactory: objOurRequest.itemFactoryId.factoryId.typeOfFactoryId.type,
      unitsNumber: objOurRequest.unitsNumber,
      unitsCost: objOurRequest.unitsNumber,
      totalcost: objOurRequest.totalcost,
    };

    // send to Stock if (orderStatus == RECIVED)
    if (
      objOurRequest.orderStatus !== orderStatusEnum.RECIVED &&
      req.body.orderStatus == orderStatusEnum.RECIVED 
    ) {
      await stockModel.create(stockRequest);
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
    await OurRequest.deleteOne(filter);
    res.status(201).json({
      statusCode: res.statusCode,
      message: "delete Our Request successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
