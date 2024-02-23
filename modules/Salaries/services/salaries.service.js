const salariesModel = require("../model/salaries.model");
const { validationResult } = require("express-validator");
const convertArray = require("../../../core/shared/errorForm");
const mongoose = require("mongoose");
const { sum } = require("lodash");
const expencesModel = require("../../expences/model/expences.model");

// get All type of Factories
exports.getAllSalaries = async (req, res, next) => {
  try {
    const queryDate = req.query.date;
    const year = new Date(queryDate).getFullYear();
    const month = new Date(queryDate).getMonth() + 1; // Months are zero-based, so add 1
    const matchQuery = {
      $expr: {
        $and: [
          { $eq: [{ $year: "$date" }, year] },
          { $eq: [{ $month: "$date" }, month] },
        ],
      },
    };

    const allSalaries = await salariesModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeId",
        },
      },
      { $unwind: "$employeeId" },
      {
        $match: matchQuery,
      },
    ]);

    const totalSalaries = sum(allSalaries.map((income) => income.amount));

    res.status(200).json({
      statusCode: 200,
      message: "Successfully fetched all Salaries",
      data: allSalaries,
      totalSalaries: totalSalaries,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

exports.getSalariesById = async (req, res) => {
  try {
    const objSalaries = await salariesModel
      .findById(req.params.id)
      .populate("employeeId");
    if (!objSalaries) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Salaries not Result",
        data: objSalaries,
      });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: objSalaries,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// create Payment Sale
exports.createSalaries = async (req, res, next) => {
  const body = req.body;
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
    // const objUser = await saleModel.findOne({ _id: body.saleId }).populate({
    //   path: "branchStockId",
    //   model: "branchStock",
    //   populate: {
    //     path: "stockId",
    //     model: "Stock",
    //   },
    // });

    // if (objUser) {
    //   return res.status(400).json({
    //     statusCode: res.statusCode,
    //     message: "Employee is Not Found",
    //   });
    // }

    await salariesModel.create(body).then(async (result) => {
      console.log(result);
      const objExpences = new expencesModel({
        typeExpences: "salary",
        paymentFactoryId: null,
        salaryId: result._id,
        amount: body.amount,
        cashDate: body.date,
      });

      await objExpences.save();
    });

    res.status(201).json({
      statusCode: res.statusCode,
      message: "Created Salary successfully",
    });
  } catch (error) {
    res;
    res.status(500).json({
      statusCode: res.statusCode,
      message: "Failed to create Salary",
      error: error.message,
    });
  }
};

// update Sale
exports.updateSalaries = async (req, res, next) => {
  const SalariesId = req.params.id;
  const body = req.body;
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
    const objsalariesModel = await salariesModel
      .findById(SalariesId)
      .populate("employeeId");
    if (!objsalariesModel) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Salary not found",
      });
    }
    const updateDocument = {
      $set: body,
    };
    await salariesModel.updateOne({ _id: SalariesId }, updateDocument);
    const objExpences = {
      typeExpences: "salary",
      paymentFactoryId: null,
      amount: body.amount,
      cashDate: body.date,
    };
    await expencesModel.updateOne(
      {
        salaryId: req.params.id,
      },
      {
        $set: objExpences,
      }
    );
    res.status(201).json({
      statusCode: res.statusCode,
      message: "Update Salary successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// Delete Sale
exports.deleteSalaries = async (req, res) => {
  const SalariesId = req.params.id;
  try {
    const objsalariesModel = await salariesModel
      .findById(SalariesId)
      .populate("employeeId");
    if (!objsalariesModel) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "salary not found",
      });
    }

    await salariesModel.deleteOne({_id:req.params.id});
    await expencesModel.deleteOne({
      salaryId: req.params.id,
    });
    res.status(201).json({
      statusCode: res.statusCode,
      message: "deleted salary successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};
