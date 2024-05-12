const { sum } = require("lodash");
const expencesModel = require("../../expences/model/expences.model");
const paymentClientModel = require("../../paymentClient/model/paymentClient.model");
const saleModel = require("../../sale/model/sale.model");
const UserRole = require("../../../core/enums/role.enum");
const mongoose = require("mongoose");
const sale = require("../../sale/model/sale.model");

exports.getAllIncomes = async (req, res, next) => {
  try {
    // const queryDate = req.query.date;
    // const year = new Date(queryDate).getFullYear();
    // const month = new Date(queryDate).getMonth() + 1; // Months are zero-based, so add 1
    // const matchQuery = {
    //   $expr: {
    //     $and: [
    //       { $eq: [{ $year: "$date" }, year] },
    //       { $eq: [{ $month: "$date" }, month] },
    //     ],
    //   },
    // };
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;
    let matchQuery = {};
    if (fromDate && toDate) {
      matchQuery["date"] = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }
    const allIncomes = await paymentClientModel.aggregate([
      {
        $lookup: {
          from: "clients",
          localField: "clientId",
          foreignField: "_id",
          as: "clientId",
        },
      },
      { $unwind: "$clientId" },
      {
        $lookup: {
          from: "users",
          localField: "recipientId",
          foreignField: "_id",
          as: "recipientId",
        },
      },
      { $unwind: "$recipientId" },
      {
        $match: matchQuery,
      },
    ]);
    // Calculate total profit
    const totalRecived = sum(allIncomes.map((income) => income.amount));
    const listOfSales = await sale.aggregate([
      {
        $match: matchQuery,
      },
    ]);
    const totalSalesValue = sum(listOfSales.map((sale) => sale.salesValue));
    // const totalBalance = sum(allIncomes.map((income) => income.balance));

    res.status(200).json({
      statusCode: 200,
      message: "Successfully fetched all incomes",
      data: allIncomes,
      totalRecived: totalRecived,
      totalSalesValue: totalSalesValue,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// exports.getAllExpences = async (req, res, next) => {
//   try {
//     const queryDate = req.query.date;
//     const year = new Date(queryDate).getFullYear();
//     const month = new Date(queryDate).getMonth() + 1; // Months are zero-based, so add 1
//     const matchQuery = {
//       $expr: {
//         $and: [
//           { $eq: [{ $year: "$cashDate" }, year] },
//           { $eq: [{ $month: "$cashDate" }, month] },
//         ],
//       },
//     };
//     const allExpences = await PaymentForFactoryModel.aggregate([
//       {
//         $match: matchQuery,
//       },
//       {
//         $lookup: {
//           from: "ourrequests",
//           localField: "ourRequestId",
//           foreignField: "_id",
//           as: "ourRequestId",
//         },
//       },
//       {
//         $unwind: "$ourRequestId",
//       },
//       {
//         $lookup: {
//           from: "itemsfactories",
//           localField: "ourRequestId.itemFactoryId",
//           foreignField: "_id",
//           as: "factoryId",
//         },
//       },
//       { $unwind: "$factoryId" },
//       {
//         $group: {
//           _id: "$ourRequestId", // Group by ourRequestId
//           payments: { $push: "$$ROOT" }, // Push all payment documents into an array
//           totalRecived: { $sum: "$ourRequestId.wasPaid" },
//           totalcost: { $first: "$ourRequestId.totalcost" },
//           itemName: { $first: "$stockInfo.itemName" },
//         },
//       },
//       {
//         $addFields: {
//           totalBalance: {
//             $subtract: ["$totalcost", "$totalRecived"],
//           },
//         },
//       },
//     ]);

//     const totalCashAmount = sum(allExpences.map((income) => income.cashAmount));
//     const totalBalance = sum(allExpences.map((income) => income.balance));

//     res.status(200).json({
//       statusCode: res.statusCode,
//       message: "successfully",
//       data: allExpences,
//       totalCashAmount: totalCashAmount,
//       totalBalance: totalBalance,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ statusCode: res.statusCode, message: error.message });
//   }
// };

exports.getAllProfitIncomes = async (req, res, next) => {
  try {
    const queryDate = req.query.date;
    const year = new Date(queryDate).getFullYear();
    const month = new Date(queryDate).getMonth() + 1; // Months are zero-based, so add 1
    let matchQuery = {};
    if (queryDate) {
      matchQuery = {
        $expr: {
          $and: [
            { $eq: [{ $year: "$date" }, year] },
            { $eq: [{ $month: "$date" }, month] },
          ],
        },
      };
    }
    let userQuery = {};
    const isAllow = req.roleName == UserRole.ADMIN;
    if (!isAllow) {
      userQuery["recipientId"] = req.userId;
    }
    const allIncomes = await paymentClientModel.aggregate([
      {
        $match: userQuery,
      },
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "clients",
          localField: "clientId",
          foreignField: "_id",
          as: "clientInfo",
        },
      },
      { $unwind: "$clientInfo" },
      {
        $lookup: {
          from: "users",
          localField: "recipientId",
          foreignField: "_id",
          as: "recipientInfo",
        },
      },
      { $unwind: "$recipientInfo" },
    ]);

    const totalPharmacy = allIncomes.reduce((sum, item) => {
      if (item.clientInfo.typeOfClient.id === 1) {
        return sum + item.amount;
      }
      return sum;
    }, 0);

    const totalStore = allIncomes.reduce((sum, item) => {
      if (item.clientInfo.typeOfClient.id === 2) {
        return sum + item.amount;
      }
      return sum;
    }, 0);

    const totalRecived = sum(allIncomes.map((profit) => profit.amount));
    const listOfSales = await sale.aggregate([
      {
        $match: matchQuery,
      },
    ]);
    const totalSalesValue = sum(listOfSales.map((sale) => sale.salesValue));

    res.status(200).json({
      statusCode: 200,
      message: "Successfully",
      data: allIncomes,
      totalRecived: totalRecived,
      totalPharmacy: totalPharmacy,
      totalStore: totalStore,
      totalSalesValue: totalSalesValue,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

exports.getAllProfitAndIncomesAndExpences = async (req, res, next) => {
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
    const allIncomes = await paymentClientModel.aggregate([
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "clients",
          localField: "clientId",
          foreignField: "_id",
          as: "clientInfo",
        },
      },
      { $unwind: "$clientInfo" },
      {
        $lookup: {
          from: "users",
          localField: "recipientId",
          foreignField: "_id",
          as: "recipientInfo",
        },
      },
      { $unwind: "$recipientInfo" },
    ]);

    const totalRecived = sum(allIncomes.map((income) => income.amount));

    const matchQueryExpences = {
      $expr: {
        $and: [
          { $eq: [{ $year: "$cashDate" }, year] },
          { $eq: [{ $month: "$cashDate" }, month] },
        ],
      },
    };
    const allExpences = await expencesModel.aggregate([
      {
        $match: matchQueryExpences,
      },
      {
        $facet: {
          withpaymentFactory: [
            {
              $match: {
                paymentFactoryId: { $exists: true },
              },
            },
            {
              $lookup: {
                from: "paymentforfactories",
                localField: "paymentFactoryId",
                foreignField: "_id",
                as: "paymentFactoryId",
              },
            },
          ],
          withoutpaymentFactory: [
            {
              $match: {
                paymentFactoryId: { $exists: false },
              },
            },
          ],
        },
      },
      {
        $project: {
          paymentFactory: {
            $concatArrays: ["$withpaymentFactory", "$withoutpaymentFactory"],
          },
        },
      },
      {
        $unwind: "$paymentFactory",
      },
      {
        $replaceRoot: { newRoot: "$paymentFactory" },
      },

      {
        $facet: {
          withSalary: [
            {
              $match: {
                salaryId: { $exists: true },
              },
            },
            {
              $lookup: {
                from: "salaries",
                localField: "salaryId",
                foreignField: "_id",
                as: "salaryId",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "salaryId.employeeId",
                foreignField: "_id",
                as: "employeeId",
              },
            },
          ],
          withoutSalary: [
            {
              $match: {
                salaryId: { $exists: false },
              },
            },
          ],
        },
      },
      {
        $project: {
          salaries: {
            $concatArrays: ["$withSalary", "$withoutSalary"],
          },
        },
      },
      {
        $unwind: "$salaries",
      },
      {
        $replaceRoot: { newRoot: "$salaries" },
      },
      {
        $facet: {
          withOtherService: [
            {
              $match: {
                otherServiceId: { $exists: true },
              },
            },
            {
              $lookup: {
                from: "otherServices",
                localField: "otherServiceId",
                foreignField: "_id",
                as: "otherServiceId",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "otherServiceId.creationBy",
                foreignField: "_id",
                as: "creationBy",
              },
            },
          ],
          withOutOtherService: [
            {
              $match: {
                otherServiceId: { $exists: false },
              },
            },
          ],
        },
      },
      {
        $project: {
          otherServices: {
            $concatArrays: ["$withOtherService", "$withOutOtherService"],
          },
        },
      },
      {
        $unwind: "$otherServices",
      },
      {
        $replaceRoot: { newRoot: "$otherServices" },
      },
    ]);

    const totalCashAmount = sum(allExpences.map((income) => income.amount));

    const totalCashAmountpaymentFactory = allExpences.reduce((sum, item) => {
      if (item.typeExpences === "FactoryPayment") {
        return sum + item.amount;
      }
      return sum;
    }, 0);

    const totalCashAmountSalaries = allExpences.reduce((sum, item) => {
      if (item.typeExpences === "salary") {
        return sum + item.amount;
      }
      return sum;
    }, 0);

    const totalCashAmountServices = allExpences.reduce((sum, item) => {
      if (item.typeExpences === "service") {
        return sum + item.amount;
      }
      return sum;
    }, 0);

    const totalCashAmountOtherService = allExpences.reduce((sum, item) => {
      if (item.typeExpences === "otherService") {
        return sum + item.amount;
      }
      return sum;
    }, 0);
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: {
        totalCashAmountpaymentFactory: totalCashAmountpaymentFactory | 0,
        totalCashAmountServices: totalCashAmountServices | 0,
        totalCashAmountSalaries: totalCashAmountSalaries | 0,
        totalCashAmountOtherService: totalCashAmountOtherService | 0,
        totalCashAmount: totalCashAmount | 0,
        totalRecived: totalRecived | 0,
        profit: totalRecived - totalCashAmount,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

exports.getAllProfitAndIncomesAndExpencesInYear = async (req, res, next) => {
  try {
    // const queryDate = req.query.date;
    const year = new Date().getFullYear();
    // const month = new Date().getMonth() + 1; // Months are zero-based, so add 1
    const matchQuery = {
      $expr: {
        $and: [{ $eq: [{ $year: "$date" }, year] }],
      },
    };

    const allIncomes = await paymentClientModel.aggregate([
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "clients",
          localField: "clientId",
          foreignField: "_id",
          as: "clientInfo",
        },
      },
      { $unwind: "$clientInfo" },
      {
        $lookup: {
          from: "users",
          localField: "recipientId",
          foreignField: "_id",
          as: "recipientInfo",
        },
      },
      { $unwind: "$recipientInfo" },
    ]);

    const totalRecived = sum(allIncomes.map((income) => income.amount));
    const matchQueryExpences = {
      $expr: {
        $and: [
          { $eq: [{ $year: "$cashDate" }, year] },
          // { $eq: [{ $month: "$cashDate" }, month] },
        ],
      },
    };
    const allExpences = await expencesModel.aggregate([
      {
        $match: matchQueryExpences,
      },
      {
        $facet: {
          withpaymentFactory: [
            {
              $match: {
                paymentFactoryId: { $exists: true },
              },
            },
            {
              $lookup: {
                from: "paymentforfactories",
                localField: "paymentFactoryId",
                foreignField: "_id",
                as: "paymentFactoryId",
              },
            },
          ],
          withoutpaymentFactory: [
            {
              $match: {
                paymentFactoryId: { $exists: false },
              },
            },
          ],
        },
      },
      {
        $project: {
          paymentFactory: {
            $concatArrays: ["$withpaymentFactory", "$withoutpaymentFactory"],
          },
        },
      },
      {
        $unwind: "$paymentFactory",
      },
      {
        $replaceRoot: { newRoot: "$paymentFactory" },
      },

      {
        $facet: {
          withSalary: [
            {
              $match: {
                salaryId: { $exists: true },
              },
            },
            {
              $lookup: {
                from: "salaries",
                localField: "salaryId",
                foreignField: "_id",
                as: "salaryId",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "salaryId.employeeId",
                foreignField: "_id",
                as: "employeeId",
              },
            },
          ],
          withoutSalary: [
            {
              $match: {
                salaryId: { $exists: false },
              },
            },
          ],
        },
      },
      {
        $project: {
          salaries: {
            $concatArrays: ["$withSalary", "$withoutSalary"],
          },
        },
      },
      {
        $unwind: "$salaries",
      },
      {
        $replaceRoot: { newRoot: "$salaries" },
      },
      {
        $facet: {
          withOtherService: [
            {
              $match: {
                otherServiceId: { $exists: true },
              },
            },
            {
              $lookup: {
                from: "otherServices",
                localField: "otherServiceId",
                foreignField: "_id",
                as: "otherServiceId",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "otherServiceId.creationBy",
                foreignField: "_id",
                as: "creationBy",
              },
            },
          ],
          withOutOtherService: [
            {
              $match: {
                otherServiceId: { $exists: false },
              },
            },
          ],
        },
      },
      {
        $project: {
          otherServices: {
            $concatArrays: ["$withOtherService", "$withOutOtherService"],
          },
        },
      },
      {
        $unwind: "$otherServices",
      },
      {
        $replaceRoot: { newRoot: "$otherServices" },
      },
    ]);

    const totalCashAmount = sum(allExpences.map((income) => income.amount));

    const totalCashAmountpaymentFactory = allExpences.reduce((sum, item) => {
      if (item.typeExpences === "FactoryPayment") {
        return sum + item.amount;
      }
      return sum;
    }, 0);

    const totalCashAmountSalaries = allExpences.reduce((sum, item) => {
      if (item.typeExpences === "salary") {
        return sum + item.amount;
      }
      return sum;
    }, 0);

    const totalCashAmountServices = allExpences.reduce((sum, item) => {
      if (item.typeExpences === "service") {
        return sum + item.amount;
      }
      return sum;
    }, 0);
    const totalCashAmountOtherService = allExpences.reduce((sum, item) => {
      if (item.typeExpences === "otherService") {
        return sum + item.amount;
      }
      return sum;
    }, 0);
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: {
        totalCashAmountpaymentFactory: totalCashAmountpaymentFactory | 0,
        totalCashAmountServices: totalCashAmountServices | 0,
        totalCashAmountSalaries: totalCashAmountSalaries | 0,
        totalCashAmountOtherService: totalCashAmountOtherService | 0,

        totalCashAmount: totalCashAmount | 0,
        totalRecived: totalRecived | 0,
        profit: totalRecived - totalCashAmount,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

exports.getStatisticsAccountGroupbyYear = async (req, res, next) => {
  try {
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const yearQuery = req.query.year;
    const year = new Date(yearQuery).getFullYear();
    const matchQueryIncome = {
      $expr: {
        $eq: [{ $year: "$date" }, year],
      },
    };
    const allIncomes = await paymentClientModel.aggregate([
      {
        $match: matchQueryIncome,
      },
      {
        $group: {
          _id: { $month: "$date" }, // Group by month
          totalRecived: { $sum: "$amount" }, // Calculate total amount for each month
          count: { $sum: 1 }, // Count the number of expenses for each month
        },
      },
    ]);
    const totalIncomes = sum(allIncomes.map((income) => income.totalRecived));

    const matchQueryExpences = {
      $expr: {
        $and: [{ $eq: [{ $year: "$cashDate" }, year] }],
      },
    };
    const allExpences = await expencesModel.aggregate([
      {
        $match: matchQueryExpences,
      },
      {
        $group: {
          _id: {
            $month: "$cashDate",
          }, // Group by month
          totalExpences: { $sum: "$amount" }, // Calculate total amount for each month
          totalPayment: {
            $sum: {
              $cond: [
                { $eq: ["$typeExpences", "FactoryPayment"] },
                "$amount",
                0,
              ],
            },
          }, // Calculate total payment amount for each month
          totalSalaries: {
            $sum: {
              $cond: [{ $eq: ["$typeExpences", "salary"] }, "$amount", 0],
            },
          }, // Calculate total salaries amount for each month
          totalServices: {
            $sum: {
              $cond: [{ $eq: ["$typeExpences", "service"] }, "$amount", 0],
            },
          }, // Calculate total services amount for each month
          totalOtherExpences: {
            $sum: {
              $cond: [{ $eq: ["$typeExpences", "otherService"] }, "$amount", 0],
            },
          }, // Calculate total services amount for each month
          count: { $sum: 1 }, // Count the number of expenses for each month
        },
      },
    ]);
    const totalExpences = sum(
      allExpences.map((expences) => expences.totalExpences)
    );

    months.forEach((ele) => {
      if (!allIncomes.find((x) => x._id == ele)) {
        allIncomes.push({
          _id: ele,
          totalExpences: 0,
          totalPayments: 0,
          totalSalaries: 0,
          totalServices: 0,
          totalOtherExpences: 0,
          count: 0,
        });
      }
      if (!allExpences.find((x) => x._id == ele)) {
        allExpences.push({
          _id: ele,
          totalIncomes: 0,
          count: 0,
        });
      }
    });

    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: {
        allIncomes: allIncomes.sort((a, b) => a._id - b._id),
        allExpences: allExpences.sort((a, b) => a._id - b._id),
        totalIncomes: totalIncomes,
        totalExpences: totalExpences,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

exports.getReportSales = async (req, res, next) => {
  try {
    let query = {};
    const clientId = req.query.clientId;
    const userId = req.query.userId;
    // const isAllow = req.roleName == UserRole.ADMIN;
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;
    const cityId = req.query.cityId;
    const governmentId = req.query.governmentId;

    if (userId) {
      query["userId._id"] = new mongoose.Types.ObjectId(userId);
    }
    if (clientId) {
      query["clientId._id"] = new mongoose.Types.ObjectId(clientId);
    }
    if (cityId) {
      query["cityId._id"] = new mongoose.Types.ObjectId(cityId);
    }
    if (governmentId) {
      query["governmentId._id"] = new mongoose.Types.ObjectId(governmentId);
    }

    if (fromDate && toDate) {
      query["date"] = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }
    const allSale = await saleModel.aggregate([
      {
        $lookup: {
          from: "branchstocks",
          localField: "branchStockId",
          foreignField: "_id",
          as: "branchStockId", // This is the additional lookup
        },
      },
      { $unwind: "$branchStockId" }, // Unwind the new field
      {
        $lookup: {
          from: "stocks",
          localField: "branchStockId.stockId",
          foreignField: "_id",
          as: "stockId",
        },
      },
      { $unwind: "$stockId" },
      {
        $lookup: {
          from: "ourrequests",
          localField: "stockId.ourRequestId",
          foreignField: "_id",
          as: "ourRequestId",
        },
      },
      { $unwind: "$ourRequestId" },
      {
        $lookup: {
          from: "factories",
          localField: "ourRequestId.factoryId",
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
        $lookup: {
          from: "itemsfactories",
          localField: "stockId.itemFactoryId",
          foreignField: "_id",
          as: "itemFactoryId",
        },
      },
      { $unwind: "$itemFactoryId" },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      { $unwind: "$userId" },
      {
        $lookup: {
          from: "clients",
          localField: "clientId",
          foreignField: "_id",
          as: "clientId",
        },
      },
      { $unwind: "$clientId" },
      {
        $lookup: {
          from: "cities",
          localField: "clientId.cityId",
          foreignField: "_id",
          as: "cityId",
        },
      },
      { $unwind: "$cityId" },
      {
        $lookup: {
          from: "governments",
          localField: "cityId.governmentId",
          foreignField: "_id",
          as: "governmentId",
        },
      },
      { $unwind: "$governmentId" },
      {
        $match: query,
      },
      {
        $addFields: {
          totalFactoryPrice: {
            $multiply: ["$salesQuantity", "$ourRequestId.unitsCost"],
          },
          totalPharmacyPrice: {
            $multiply: ["$salesQuantity", "$ourRequestId.unitsCost"],
          },
        },
      },
      {
        $addFields: {
          NetProfit: {
            $subtract: ["$salesValue", "$totalFactoryPrice"],
          },
        },
      },
    ]);

    const totalNetProfit = sum(allSale.map((payment) => payment.NetProfit));
    const totalsalesQuantity = sum(
      allSale.map((payment) => payment.salesQuantity)
    );

    const totalSalesValue = sum(
      allSale.map((payment) => payment.salesValue)
    );

    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: {
        listOfSales: allSale,
        totalsalesQuantity:totalsalesQuantity,
        totalNetProfit: totalNetProfit,
        totalSalesValue: totalSalesValue,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

exports.getReportItemSales = async (req, res, next) => {
  try {
    let query = {};
    const clientId = req.query.clientId;
    const userId = req.query.userId;
    // const isAllow = req.roleName == UserRole.ADMIN;
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;
    const cityId = req.query.cityId;
    const governmentId = req.query.governmentId;

    if (userId) {
      query["userId._id"] = new mongoose.Types.ObjectId(userId);
    }
    if (clientId) {
      query["clientId._id"] = new mongoose.Types.ObjectId(clientId);
    }
    if (cityId) {
      query["cityId._id"] = new mongoose.Types.ObjectId(cityId);
    }
    if (governmentId) {
      query["governmentId._id"] = new mongoose.Types.ObjectId(governmentId);
    }

    if (fromDate && toDate) {
      query["date"] = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }
    const allSale = await saleModel.aggregate([
      {
        $lookup: {
          from: "branchstocks",
          localField: "branchStockId",
          foreignField: "_id",
          as: "branchStockId", // This is the additional lookup
        },
      },
      { $unwind: "$branchStockId" }, // Unwind the new field
      {
        $lookup: {
          from: "stocks",
          localField: "branchStockId.stockId",
          foreignField: "_id",
          as: "stockId",
        },
      },
      { $unwind: "$stockId" },
      {
        $lookup: {
          from: "ourrequests",
          localField: "stockId.ourRequestId",
          foreignField: "_id",
          as: "ourRequestId",
        },
      },
      { $unwind: "$ourRequestId" },
      {
        $lookup: {
          from: "factories",
          localField: "ourRequestId.factoryId",
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
        $lookup: {
          from: "itemsfactories",
          localField: "stockId.itemFactoryId",
          foreignField: "_id",
          as: "itemFactoryId",
        },
      },
      { $unwind: "$itemFactoryId" },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      { $unwind: "$userId" },
      {
        $lookup: {
          from: "clients",
          localField: "clientId",
          foreignField: "_id",
          as: "clientId",
        },
      },
      { $unwind: "$clientId" },
      {
        $lookup: {
          from: "cities",
          localField: "clientId.cityId",
          foreignField: "_id",
          as: "cityId",
        },
      },
      { $unwind: "$cityId" },
      {
        $lookup: {
          from: "governments",
          localField: "cityId.governmentId",
          foreignField: "_id",
          as: "governmentId",
        },
      },
      { $unwind: "$governmentId" },
      {
        $match: query,
      },
      {
        $group: {
          _id: "$itemFactoryId._id",
          // sales: { $push: "$$ROOT" },
          itemName: { $first: "$itemFactoryId.name" },
          factoryType: { $first: "$typeOfFactoryId.type" },
          factoryName: { $first: "$factoryId.name" },
          totalSalesValue: { $sum: "$salesValue" },
          // patchNumber: { $first: "$ourRequestId.patchNumber" },
          totalsalesQuantity: { $sum: "$salesQuantity" },
        },
      },
    ]);
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: allSale.sort((a, b) => b.totalsalesQuantity - a.totalsalesQuantity),
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};
