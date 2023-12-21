const PaymentForFactory = require("../model/paymentForFactories.model");
const ourRequest = require("../../ourRequest/model/ourRequest.model");
const FactoryAccountLogModel = require("../../FactoryAccounts/model/factoryAccount.model");
const convertArray = require("../../../core/shared/errorForm");
const calculatePaymentFactory = require("../../../core/shared/calculatePaymentFactory");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Create a new PaymentForFactory
exports.createPaymentForFactory = async (req, res) => {
  let session = await mongoose.startSession();
  session.startTransaction();

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
        message: "not exist Request",
      });
    }

    // chach cashAmount and balance
    let oldBalance = 0;
    oldBalance = new calculatePaymentFactory().calculateBalance(
      objOurRequest.totalcost,
      objOurRequest.wasPaid
    );
    if (cashAmount > oldBalance) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "cach Amount More than Balance",
      });
    }

    // calculate (wasPaid)
    let wasPaid = 0;
    wasPaid = new calculatePaymentFactory().IncreaseWasPaid(
      objOurRequest.wasPaid,
      cashAmount
    );

    // update Our Request
    const filter = { _id: ourRequestId };
    const updateDocument = {
      $set: { wasPaid: wasPaid },
    };
    await ourRequest.updateOne(filter, updateDocument);

    // calculate (balance)
    let balance = 0;
    let newPaymentForFactoryId = 0;
    balance = new calculatePaymentFactory().calculateBalance(
      objOurRequest.totalcost,
      wasPaid
    );

    // create PaymentForFactory
    body["balance"] = balance;
    const newPaymentForFactory = await PaymentForFactory.create(body);
    if (newPaymentForFactory) {
      newPaymentForFactoryId = newPaymentForFactory._id;
    }
    // create Factory Account Log
    // body["balance"] = balance;
    body["paymentForFactoryId"] = newPaymentForFactoryId;
    await FactoryAccountLogModel.create(body);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      statusCode: res.statusCode,
      message: "create Payment For Factory successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// get All Payment For Factories
exports.getAllPaymentForFactories = async (req, res) => {
  try {
    const PaymentForFactories = await PaymentForFactory.find({}).populate({
      path: "ourRequestId",
      populate: {
        path: "itemFactoryId",
        model: "ItemsFactory",
        select: "name -_id",
        populate: {
          path: "factoryId",
          model: "Factory",
          select: "name -_id",
        },
      },
    });

    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: PaymentForFactories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get All Payment For OurRequest
exports.getAllPaymentForOurRequest = async (req, res) => {
  try {
    const PaymentForFactories = await PaymentForFactory.find({}).populate({
      path: "ourRequestId",
      populate: {
        path: "itemFactoryId",
        model: "ItemsFactory",
        select: "name -_id",
        populate: {
          path: "factoryId",
          model: "Factory",
          select: "name -_id",
        },
      },
    });

    const listOfUniqueOurRequests = PaymentForFactories.reduce(
      (uniqueItems, payment) => {
        const found = uniqueItems.find(
          (item) => item._id === payment.ourRequestId._id
        );
        if (!found) {
          uniqueItems.push({
            ourRequest: payment.ourRequestId,
            listOfPayments: [],
          });
        }
        return uniqueItems;
      },
      []
    );

    listOfUniqueOurRequests.forEach((ele, index) => {
      const filter = PaymentForFactories.filter(
        (item) => item.ourRequestId._id == ele.ourRequest._id
      );
      listOfUniqueOurRequests[index].listOfPayments = filter;
    });

    return res.json({ listOfUniqueOurRequests });

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
    const objPaymentForFactory = await PaymentForFactory.findById(
      req.params.id
    ).populate("ourRequestId");
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
// exports.updateData = async (item , newObjourRequest , count) => {
//   const filter = {_id:newObjourRequest._id}
//   increaseWasPaid = new calculatePaymentFactory().IncreaseWasPaid(
//     newObjourRequest.wasPaid,
//     item.cashAmount
//   );
//   await ourRequest.updateOne(filter, {
//     $set: { wasPaid: increaseWasPaid },
//   });
//   newObjourRequest = await ourRequest.findOne(filter);
//   // calculate(balance)
//   let newBalance = 0;
//   newBalance = new calculatePaymentFactory().calculateBalance(
//     newObjourRequest.totalcost,
//     newObjourRequest.wasPaid
//   );
  
//   await PaymentForFactory.updateOne({_id:item._id}, {
//     $set: { balance: newBalance },
//   });
//   console.log(count);
// }
// Update a factory by ID
exports.updatePaymentForFactory = async (req, res) => {
  let session = await mongoose.startSession();
  session.startTransaction();
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

    const filterPaymentForFactoryId = { _id: req.params.id };
    const { ourRequestId, cashAmount } = req.body;

    const objPaymentForFactory = await PaymentForFactory.findOne(
      filterPaymentForFactoryId
    ).populate("ourRequestId");
    if (!objPaymentForFactory) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found Item",
      });
    }
    const oldObjOurRequest = await ourRequest.findOne({
      _id: ourRequestId,
    });
    if (!oldObjOurRequest) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "not exist Request",
      });
    }
    const oldBalance = new calculatePaymentFactory().calculateBalance(
      oldObjOurRequest.totalcost,
      oldObjOurRequest.wasPaid - objPaymentForFactory.cashAmount
    );
    if (cashAmount > oldBalance) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "cach Amount More than Balance",
      });
    }

    // update Payment For Factory
    await PaymentForFactory.updateOne(filterPaymentForFactoryId, {
      $set: req.body,
    });

    // Deleted Account Log
    await FactoryAccountLogModel.deleteOne({
      paymentForFactoryId: req.params.id,
    });

    const filter = { _id: ourRequestId };
    const updateDocument = {$set: { wasPaid: 0 }};
    let newObjourRequest = {};
    let increaseWasPaid = 0;
    
    
    // update Our Request all Waspaid = 0
    await ourRequest.updateMany(filter, updateDocument);
    newObjourRequest = await ourRequest.findOne({
      _id: ourRequestId,
    });


    const listOfPaymentForFactories = await PaymentForFactory.find({
      ourRequestId: objPaymentForFactory.ourRequestId._id,
    });
    for (const item of listOfPaymentForFactories) {
      increaseWasPaid = new calculatePaymentFactory().IncreaseWasPaid(
        newObjourRequest.wasPaid,
        item.cashAmount
      );
      await ourRequest.updateOne(filter, {
        $set: { wasPaid: increaseWasPaid },
      });
      newObjourRequest = await ourRequest.findOne(filter);
      // calculate(balance)
      let newBalance = 0;
      newBalance = new calculatePaymentFactory().calculateBalance(
        newObjourRequest.totalcost,
        newObjourRequest.wasPaid
      );
      
      await PaymentForFactory.updateOne({_id:item._id}, {
        $set: { balance: newBalance },
      });
    }
    // listOfPaymentForFactories.forEach(async (item) => {
    //   count++

    // });

    newObjourRequest = await ourRequest.findOne(filter);

    // calculate(balance)
    let balance = 0;
    balance = new calculatePaymentFactory().calculateBalance(
      newObjourRequest.totalcost,
      newObjourRequest.wasPaid
    );


    // create Factory Account Log
    const logData = {
      ...req.body,
      balance: balance,
      paymentForFactoryId: req.params.id,
    };
    await FactoryAccountLogModel.create(logData);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      statusCode: res.statusCode,
      message: "Updated Payment successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// Delete a factory by ID
exports.deletePaymentForFactory = async (req, res) => {
  let session = await mongoose.startSession();
  session.startTransaction();
  try {
    const filterPaymentForFactoryId = { _id: req.params.id };
    const objPaymentForFactory = await PaymentForFactory.findOne(
      filterPaymentForFactoryId
    ).populate("ourRequestId");
    if (!objPaymentForFactory) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found Item",
      });
    }

    // claculate was paid
    let wasPaid = 0;
    wasPaid = new calculatePaymentFactory().DecreaseWasPaid(
      objPaymentForFactory.ourRequestId.wasPaid,
      objPaymentForFactory.cashAmount
    );

    // update Our Request
    const filterOurRequest = { _id: objPaymentForFactory.ourRequestId._id };
    const updateDocument = {
      $set: { wasPaid: wasPaid },
    };
    await ourRequest.updateOne(filterOurRequest, updateDocument);

    // Remove Account Log
    await FactoryAccountLogModel.deleteOne({
      paymentForFactoryId: filterPaymentForFactoryId,
    });

    // increse all balance (add cach Amount)
    await PaymentForFactory.updateMany(
      { ourRequestId: objPaymentForFactory.ourRequestId._id },
      {
        $inc: { balance: objPaymentForFactory.cashAmount },
      }
    );

    // increse all balance (add cach Amount)
    await FactoryAccountLogModel.updateMany(
      { ourRequestId: objPaymentForFactory.ourRequestId._id },
      {
        $inc: { balance: objPaymentForFactory.cashAmount },
      }
    );

    // // calculate (balance)
    // let balance = 0;
    // balance = new calculatePaymentFactory().calculateBalance(
    //   objPaymentForFactory.ourRequestId.totalcost,
    //   wasPaid
    // );

    // Remove Payment For Factory
    await PaymentForFactory.deleteOne(filterPaymentForFactoryId);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      statusCode: res.statusCode,
      message: "deleted Payment successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};
