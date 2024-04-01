const PaymentForFactory = require("../model/paymentForFactories.model");
const convertArray = require("../../../core/shared/errorForm");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const expencesModel = require("../../expences/model/expences.model");
const { sum } = require("lodash");
const Factory = require("../../factory/model/factory.model");
const treasurAmount = require("../../treasur/model/treasurAmount.model");

exports.totalCashAmountAndBalanceByMonthPaymentFactory = async (req, res) => {
  const classificationId = req.query.classificationId;
  const factoryId = req.query.factoryId;
  const queryDate = req.query.date;
  const year = new Date(queryDate).getFullYear();
  const month = new Date(queryDate).getMonth() + 1;
  let query = {}; // Months are zero-based, so add 1
  const matchQuery = {
    $expr: {
      $and: [
        { $eq: [{ $year: "$cashDate" }, year] },
        { $eq: [{ $month: "$cashDate" }, month] },
      ],
    },
  };
  if (factoryId) {
    query["factoryId._id"] = new mongoose.Types.ObjectId(factoryId);
  }
  if (classificationId) {
    query["typeOfFactoryId.classificationId"] = parseInt(classificationId);
  }
  try {
    const totals = await PaymentForFactory.aggregate([
      {
        $match: matchQuery,
      },
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
      // {
      //   $match: {
      //     cashDate: {
      //       $gte: new Date(`${currentYear}-${currentMonth}-01`),
      //       $lt: new Date(`${currentYear}-${currentMonth + 1}-01`),
      //     },
      //   },
      // },
      // {
      //   $group: {
      //     // _id: `${currentYear}-${currentMonth}-01`,
      //     _id: "$ourRequestId", // Group by ourRequestId
      //     payments: { $push: "$$ROOT" }, // Push all payment documents into an array
      //     totalRecived: { $sum: "$ourRequestId.wasPaid" },
      //     totalcost: { $first: "$ourRequestId.totalcost" },
      //     itemName: { $first: "$stockInfo.itemName" },
      //     totalCashAmount: { $sum: "$cashAmount" },
      //     totalBalance: { $sum: "$balance" },
      //   },
      // },
      // {
      //   $addFields: {
      //     // profit: { $subtract: ["$totalRecived", "$totalCost"] },
      //     totalBalance: {
      //       $subtract: ["$totalcost", "$totalCashAmount"],
      //     },
      //   },
      // },
    ]);
    const objMap = {
      date: `${queryDate}`,
      totalCashAmount: sum(totals.map((ele) => ele.cashAmount)),
      // totalBalance: sum(totals.map((ele) => ele.totalBalance)),
    };
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: objMap,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.totalCashAmountAndBalanceByYearPaymentFactory = async (req, res) => {
  const queryDate = req.query.date;
  const year = new Date(queryDate).getFullYear();
  const classificationId = req.query.classificationId;
  const factoryId = req.query.factoryId;
  let query = {}; // Months are zero-based, so add 1
  if (factoryId) {
    query["factoryId._id"] = new mongoose.Types.ObjectId(factoryId);
  }
  if (classificationId) {
    query["typeOfFactoryId.classificationId"] = parseInt(classificationId);
  }
  const matchQuery = {
    $expr: {
      $and: [{ $eq: [{ $year: "$cashDate" }, year] }],
    },
  };
  try {
    const totals = await PaymentForFactory.aggregate([
      {
        $match: matchQuery,
      },
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
      // {
      //   $match: {
      //     cashDate: {
      //       $gte: new Date(`${currentYear}-01-01`),
      //       $lt: new Date(`${currentYear + 1}-01-01`),
      //     },
      //   },
      // },
      // {
      //   $group: {
      //     // _id: `${currentYear}-${currentMonth}-01`,
      //     _id: "$ourRequestId", // Group by ourRequestId
      //     payments: { $push: "$$ROOT" }, // Push all payment documents into an array
      //     totalRecived: { $sum: "$ourRequestId.wasPaid" },
      //     totalcost: { $first: "$ourRequestId.totalcost" },
      //     itemName: { $first: "$stockInfo.itemName" },
      //     totalCashAmount: { $sum: "$cashAmount" },
      //     totalBalance: { $sum: "$balance" },
      //   },
      // },
      // {
      //   $addFields: {
      //     // profit: { $subtract: ["$totalRecived", "$totalCost"] },
      //     totalBalance: {
      //       $subtract: ["$totalcost", "$totalCashAmount"],
      //     },
      //   },
      // },
    ]);
    const objMap = {
      date: `${queryDate}`,
      totalCashAmount: sum(totals.map((ele) => ele.cashAmount)),
      // totalBalance: sum(totals.map((ele) => ele.totalBalance)),
    };
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: objMap,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
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
    const { factoryId, cashAmount, cashDate } = req.body;
    const objFactory = await Factory.findOne({
      _id: factoryId,
    });
    if (!objFactory) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "not exist Request",
      });
    }

    objFactory.wasPaid += cashAmount;

    // let newPaymentForFactoryId;
    await PaymentForFactory.create(body).then(async (result) => {
      // newPaymentForFactoryId = result._id;
      const objExpences = new expencesModel({
        typeExpences: "FactoryPayment",
        paymentFactoryId: result._id,
        amount: cashAmount,
        cashDate: cashDate,
      });
      let objTreasurAmount = await treasurAmount.findOne({ id: 1 });
      objTreasurAmount.amount -= body.cashAmount;
      await objTreasurAmount.save();
      await objFactory.save();
      await objExpences.save();
    });
    // create Factory Account Log
    // body["paymentForFactoryId"] = newPaymentForFactoryId;
    // await FactoryAccountLogModel.create(body);

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
    const classificationId = req.query.classificationId;
    const factoryId = req.query.factoryId;
    const queryDate = req.query.date;
    const year = new Date(queryDate).getFullYear();
    const month = new Date(queryDate).getMonth() + 1;
    let query = {}; // Months are zero-based, so add 1
    const matchQuery = {
      $expr: {
        $and: [
          { $eq: [{ $year: "$cashDate" }, year] },
          // { $eq: [{ $month: "$cashDate" }, month] },
        ],
      },
    };
    if (factoryId) {
      query["factoryId._id"] = new mongoose.Types.ObjectId(factoryId);
    }
    if (classificationId) {
      query["typeOfFactoryId.classificationId"] = parseInt(classificationId);
    }
    const PaymentForFactories = await PaymentForFactory.aggregate([
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "itemsfactories",
          let: { itemFactoryId: "$itemFactoryId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$itemFactoryId"] },
              },
            },
          ],
          as: "itemFactoryId",
        },
      },
      { $unwind: { path: "$itemFactoryId", preserveNullAndEmptyArrays: true } },
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

    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: PaymentForFactories.reverse(),
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

    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: listOfUniqueOurRequests.reverse(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Payment by factoryId
exports.getPaymentByFactoryId = async (req, res) => {
  try {
    const factoryId = req.params.factoryId;
    const objectIdFactoryId = new mongoose.Types.ObjectId(factoryId);

    let listOfPaymentByFactoryId = await PaymentForFactory.aggregate([
      {
        $lookup: {
          from: "itemsfactories",
          localField: "ourRequestId.itemFactoryId",
          foreignField: "_id",
          as: "factoryId",
        },
      },
      { $unwind: "$factoryId" },
      {
        $match: {
          "ourRequestId.factoryId": objectIdFactoryId,
        },
      },
    ]);
    if (listOfPaymentByFactoryId.length == 0) {
      return res
        .status(404)
        .json({ message: "Payment Factory not found", data: [] });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: listOfPaymentByFactoryId,
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
    ).populate("factoryId");
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
  let session = await mongoose.startSession();
  session.startTransaction();
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
    const objPaymentFactory = await PaymentForFactory.findOne({
      _id: req.params.id,
    });
    const { factoryId, cashAmount, cashDate, note , itemFactoryId,patchNumber } = req.body;
    const objFactory = await Factory.findOne({
      _id: objPaymentFactory.factoryId,
    });
    if (!objFactory) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "not exist Request",
      });
    }

    objFactory.wasPaid -= objPaymentFactory.cashAmount;

    copyObjPaymentFactory = JSON.parse(JSON.stringify(objPaymentFactory));

    objPaymentFactory.cashAmount = cashAmount;
    objPaymentFactory.factoryId = factoryId;
    objPaymentFactory.cashDate = cashDate;
    objPaymentFactory.note = note;
    objPaymentFactory["itemFactoryId"] = itemFactoryId;
    objPaymentFactory["patchNumber"] = patchNumber;

    // let newPaymentForFactoryId;
    await objPaymentFactory.save().then(async (result) => {
      await objFactory.save();
      const objNewFactory = await Factory.findOne({
        _id: factoryId,
      });

      objNewFactory.wasPaid += cashAmount;
      await objNewFactory.save();

      // newPaymentForFactoryId = result._id;
      const objExpences = await expencesModel.findOne({
        paymentFactoryId: req.params.id,
      });
      objExpences.amount = cashAmount;
      objExpences.cashDate = cashDate;
      let objTreasurAmount = await treasurAmount.findOne({ id: 1 });
      objTreasurAmount.amount += copyObjPaymentFactory.cashAmount;

      objTreasurAmount.amount -= cashAmount;
      await objTreasurAmount.save();
      await objExpences.save();
    });

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
    const objPaymentFactory = await PaymentForFactory.findOne(
      filterPaymentForFactoryId
    ).populate("factoryId");
    if (!objPaymentFactory) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found payment",
      });
    }

    const objFactory = await Factory.findOne({
      _id: objPaymentFactory.factoryId,
    });
    if (!objFactory) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "not exist Factory",
      });
    }
    copyObjPaymentFactory = JSON.parse(JSON.stringify(objPaymentFactory));

    objFactory.wasPaid -= objPaymentFactory.cashAmount;

    await PaymentForFactory.deleteOne(filterPaymentForFactoryId).then(
      async (result) => {
        await objFactory.save();

        let objTreasurAmount = await treasurAmount.findOne({ id: 1 });
        objTreasurAmount.amount += copyObjPaymentFactory.cashAmount;

        await objTreasurAmount.save();
        await expencesModel.deleteOne({
          paymentFactoryId: req.params.id,
        });
      }
    );

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
