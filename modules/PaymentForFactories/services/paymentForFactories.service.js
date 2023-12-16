const PaymentForFactory = require("../model/paymentForFactories.model");
const ourRequest = require("../../ourRequest/model/ourRequest.model");
const FactoryAccountLogModel = require("../../FactoryAccounts/model/factoryAccount.model")
const convertArray = require("../../../core/shared/errorForm");
const calculatePaymentFactory = require("../../../core/shared/calculatePaymentFactory");
const { validationResult } = require("express-validator");

// Create a new PaymentForFactory
exports.createPaymentForFactory = async (req, res) => {
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

    const { ourRequestId, cashAmount } = req.body;
    const objOurRequest = await ourRequest.findOne({
      _id: ourRequestId,
    });
    if (!objOurRequest) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "not exist item Factory",
      });
    }

    // calculate (wasPaid)
    let wasPaid = 0 ;
    wasPaid = new calculatePaymentFactory().addWasPaid(objOurRequest.wasPaid , cashAmount)
    
    // update Our Request
    const filter = { _id: ourRequestId };
    const updateDocument = {
      $set: {wasPaid:wasPaid},
    };
    await ourRequest.updateOne(filter, updateDocument);
    
    // calculate (balance)
    let balance = 0 ;
    balance = new calculatePaymentFactory().calculateBalance(objOurRequest.totalcost , wasPaid)
    
    // create PaymentForFactory
    await PaymentForFactory.create(body);

    // create Factory Account Log
    body['balance'] = balance;
    await FactoryAccountLogModel.create(body);

    return res.status(201).json({
      statusCode: res.statusCode,
      message: "create Payment For Factory successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all factories
exports.getAllPaymentForFactories = async (req, res) => {
  try {
    const PaymentForFactories = await PaymentForFactory.find({}).populate("ourRequestId");
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: PaymentForFactories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific factory by ID
exports.getPaymentForFactoryById = async (req, res) => {
  try {
    const objPaymentForFactory = await PaymentForFactory.findById(req.params.id).populate(
      "ourRequestId"
    );
    if (!objPaymentForFactory) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: objPaymentForFactory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get factories by factoryId
// exports.getPaymentForFactoryByFactoryId = async (req, res) => {
//   try {
//     const itemFactory = await PaymentForFactory.find({
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
exports.updatePaymentForFactory = async (req, res) => {
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
    let objPaymentForFactory = await PaymentForFactory.findOne({
      _id: req.body.id,
    });
    if (!objPaymentForFactory) {
      return res.status(404).json({
        message: "Payment For Factory not found",
        data: [],
      });
    }
    const objOurRequest = await ourRequest.findOne({
      _id: req.body.ourRequestId,
    });
    if (!objOurRequest) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "Item not exists",
      });
    }    
    const filter = { _id: req.body.id };
    const updateDocument = {
      $set: req.body,
    };

    await PaymentForFactory.updateOne(filter, updateDocument);
    res.status(201).json({
      statusCode: res.statusCode,
      message: "update Payment For Factory successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a factory by ID
exports.deletePaymentForFactory = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const objPaymentForFactory = await PaymentForFactory.findOne(filter);
    if (!objPaymentForFactory) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found Item",
      });
    }
    await PaymentForFactory.deleteOne(filter);
    res.status(201).json({
      statusCode: res.statusCode,
      message: "delete Payment For Factory successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
