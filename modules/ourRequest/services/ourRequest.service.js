const OurRequest = require("../model/ourRequest.model");
const itemsFactoryModel = require("../../itemsFactory/model/itemsFactory.model");
const convertArray = require("../../../core/shared/errorForm");
const { validationResult } = require("express-validator");

// Create a new OurRequest
exports.createOurRequest = async (req, res) => {
  var body = Object.assign({} , req.body)
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
    // calculation total cost
    let totalcost = 0;
    totalcost = (body.unitsNumber * body.unitsCost);
    body['totalcost'] = totalcost;
    
    await OurRequest.create(body);
    return res.status(201).json({
      statusCode: res.statusCode,
      message: "create Our Request successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all factories
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

// Get a specific factory by ID
exports.getOurRequestById = async (req, res) => {
  try {
    const objOurRequest = await OurRequest
      .findById(req.params.id)
      .populate("itemFactoryId");
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

// Get factories by factoryId
// exports.getOurRequestByFactoryId = async (req, res) => {
//   try {
//     const itemFactory = await OurRequest.find({
//       factoryId: req.params.factoryId,
//     });
//     if (!itemFactory) {
//       return res.status(404).json({ message: "Item not found", data: [] });
//     }
//     res.status(200).json({
//       statusCode: res.statusCode,
//       message: "successfully",
//       data: itemFactory,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// Update a factory by ID
exports.updateOurRequest = async (req, res) => {
  const errors = validationResult(req);
  if (!req.params.id) {
    return res.status(400).json({
      statusCode: res.statusCode,
      message: "ID Is Requierd"
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
    let OurRequestToUpdate = await OurRequest.findOne({
      _id: req.params.id,
    });
    if (!OurRequestToUpdate) {
      return res.status(404).json({
        message: "Items not found",
        data: [],
      });
    }

    OurRequestToUpdate.name = req.body.name || OurRequestToUpdate.name;
    OurRequestToUpdate.factoryId =
      req.body.factoryId || OurRequestToUpdate.factoryId;

    await OurRequestToUpdate.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "update Item successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a factory by ID
exports.deleteOurRequest = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const existingType = await OurRequest.findOne(filter);
    if (!existingType) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found Item",
      });
    }
    await OurRequest.deleteOne(filter);
    res.status(201).json({
      statusCode: res.statusCode,
      message: "delete Item successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
