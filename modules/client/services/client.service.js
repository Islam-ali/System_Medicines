const { clientModel, listtypeOfClient } = require("../model/client.model");
const { validationResult } = require("express-validator");
const convertArray = require("../../../core/shared/errorForm");
const logClientModel = require("../../log-client/model/log-client.model");
const sale = require("../../sale/model/sale.model");
const { sum } = require("lodash");
const paymentClient = require("../../paymentClient/model/paymentClient.model");
const mongoose = require("mongoose");

exports.listTypeOfClient = async (req, res, next) => {
  try {
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: listtypeOfClient,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// get All type of Factories
exports.getAllClient = async (req, res, next) => {
  let query = {};
  const clientTypeId = req.query.clientTypeId;
  const clientId = req.query.clientId;
  if (clientTypeId) {
    query["typeOfClient.id"] = parseInt(clientTypeId);
  }

  if (clientId) {
    query["_id"] = parseInt(clientId);
  }

  try {
    const allClient = await clientModel.find(query).populate({
      path: "cityId",
      model: "city",
      populate: {
        path: "governmentId",
        model: "government",
      },
    });
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: allClient,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

exports.getClientById = async (req, res, next) => {
  try {
    const client = await clientModel.findOne({ _id: req.params.id }).populate({
      path: "cityId",
      model: "city",
      populate: {
        path: "governmentId",
        model: "government",
      },
    });
    const date = new Date();
    const currentYear = date.getFullYear();
    const matchQuery = {
      clientId: new mongoose.Types.ObjectId(req.params.id),
      $expr: {
        $and: [{ $eq: [{ $year: "$date" }, currentYear] }],
      },
    };
    const matchQuery2 = {
      clientId: new mongoose.Types.ObjectId(req.params.id),
      $expr: {
        $and: [{ $ne: [{ $year: "$date" }, currentYear] }],
      },
    };
    const listOfSales = await sale.aggregate([
      {
        $match: matchQuery,
      },
    ]);
    const listOfPaymentClient = await paymentClient.aggregate([
      {
        $match: matchQuery,
      },
    ]);

    const listOfSales2 = await sale.aggregate([
      {
        $match: matchQuery2,
      },
    ]);
    const listOfPaymentClient2 = await paymentClient.aggregate([
      {
        $match: matchQuery2,
      },
    ]);
    
    const totalSalesValue = sum(listOfSales.map((sale) => sale.salesValue));
    const totalwasPaid = sum(listOfPaymentClient.map((sale) => sale.amount));

    const totalSalesValue2 = sum(listOfSales2.map((sale) => sale.salesValue));
    const totalwasPaid2 = sum(listOfPaymentClient2.map((sale) => sale.amount));

    const allSalesValue = totalSalesValue + totalSalesValue2;
    const allwasPaid = totalwasPaid + totalwasPaid2;

    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: {
        ...client._doc,
        totalSalesValue: totalSalesValue,
        totalwasPaid: totalwasPaid,
        totalSalesValue2: totalSalesValue2,
        totalwasPaid2: totalwasPaid2,
        balanceRelay : totalSalesValue2 - totalwasPaid2,
        balance: allSalesValue - allwasPaid,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

exports.getClientsByTypeOfClientId = async (req, res) => {
  try {
    const listOfClients = await clientModel.find({
      "typeOfClient.id": parseInt(req.params.typeOfClientId),
    });
    if (!listOfClients) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "client not found",
        data: listOfClients,
      });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: listOfClients,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// create client
exports.createClient = async (req, res, next) => {
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
    const existingClient = await clientModel.findOne({
      name: req.body.name,
    });
    if (existingClient) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "name already exists",
      });
    }

    const newClient = new clientModel({
      name: req.body.name,
      typeOfClient: listtypeOfClient.find(
        (type) => type.id == req.body.typeOfClient
      ),
      cityId: req.body.cityId,
      owner: req.body.owner,
      phone: req.body.phone,
    });
    await newClient.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "created client successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// update client
exports.updateClient = async (req, res, next) => {
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
    const objClient = await clientModel.findOne({
      _id: req.params.id,
    });
    if (!objClient) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "not exist client",
      });
    }
    const filterexist = { name: req.body.name, _id: { $ne: req.params.id } };
    const existingname = await clientModel.findOne(filterexist);
    if (existingname) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "name already exists",
      });
    }

    (objClient.name = req.body.name),
      (objClient.typeOfClient = listtypeOfClient.find(
        (type) => type.id == req.body.typeOfClient
      )),
      (objClient.cityId = req.body.cityId),
      (objClient.owner = req.body.owner),
      (objClient.phone = req.body.phone),
      await objClient.save();

    res.status(201).json({
      statusCode: res.statusCode,
      message: "updated client successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// Delete client
exports.deleteClient = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const existingType = await clientModel.findOne(filter);
    if (!existingType) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found client",
      });
    }
    await clientModel.deleteOne(filter).then(async (result) => {
      await logClientModel.deleteMany({ clientId: req.params.id });
    });
    res.status(201).json({
      statusCode: res.statusCode,
      message: "deleted client successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// get All type of Factories
exports.getLogClient = async (req, res) => {
  try {
    let query = req.query;
    let matchSale = {};
    query.clientId ? (matchSale["clientId"] = query.clientId) : null;

    const allLogClient = await logClientModel
      .find(query)
      .populate({
        path: "creationBy",
        model: "users",
        select: "-password -roleId",
      })
      .populate({
        path: "paymentClientId",
        model: "paymentClient",
      })
      .populate({
        path: "saleId",
        model: "sale",
      })
      .populate({
        path: "beforUpdatePaymentClient",
        // model: "paymentClient",
        populate: [
          {
            path: "saleId",
            model: "sale",
            populate: {
              path: "branchStockId",
              model: "branchStock",
              populate: {
                path: "stockId",
                model: "Stock",
              },
            },
          },
          {
            path: "recipientId",
            model: "users",
            select: "-password -roleId",
          },
        ],
      })
      .populate({
        path: "afterUpdatePaymentClient",
        // model: "paymentClient",
        populate: [
          {
            path: "saleId",
            model: "sale",
            populate: {
              path: "branchStockId",
              model: "branchStock",
              populate: {
                path: "stockId",
                model: "Stock",
              },
            },
          },
          {
            path: "recipientId",
            model: "users",
            select: "-password -roleId",
          },
        ],
      })
      .populate({
        path: "beforUpdateSale",
        // model: "sale",
        populate: {
          path: "branchStockId",
          model: "branchStock",
          populate: {
            path: "stockId",
            model: "Stock",
          },
        },
      })
      .populate({
        path: "afterUpdateSale",
        // model: "sale",
        populate: {
          path: "branchStockId",
          model: "branchStock",
          populate: {
            path: "stockId",
            model: "Stock",
          },
        },
      })
      .populate({
        path: "clientId",
        model: "client",
      })
      .populate({
        path: "creationBy",
        model: "users",
      });
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: allLogClient.reverse(),
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};
