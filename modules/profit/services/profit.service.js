const { sum } = require("lodash");
const PaymentForFactoryModel = require("../../PaymentForFactories/model/paymentForFactories.model");
const paymentSaleModel = require("../../paymentSale/model/paymentSale.model");
const expencesModel = require("../../expences/model/expences.model");

exports.getAllIncomes = async (req, res, next) => {
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

    const allIncomes = await paymentSaleModel.aggregate([
      {
        $lookup: {
          from: "sales",
          localField: "saleId",
          foreignField: "_id",
          as: "saleId",
        },
      },
      { $unwind: "$saleId" },
      {
        $lookup: {
          from: "clients",
          localField: "saleId.clientId",
          foreignField: "_id",
          as: "saleId.clientId",
        },
      },
      { $unwind: "$saleId.clientId" },
      {
        $lookup: {
          from: "branchstocks",
          localField: "saleId.branchStockId",
          foreignField: "_id",
          as: "saleId.branchStockId",
        },
      },
      { $unwind: "$saleId.branchStockId" },
      {
        $lookup: {
          from: "stocks",
          localField: "saleId.branchStockId.stockId",
          foreignField: "_id",
          as: "saleId.branchStockId.stockId",
        },
      },
      { $unwind: "$saleId.branchStockId.stockId" },
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
    const totalBalance = sum(allIncomes.map((income) => income.balance));

    res.status(200).json({
      statusCode: 200,
      message: "Successfully fetched all incomes",
      data: allIncomes,
      totalRecived: totalRecived,
      totalBalance: totalBalance,
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
    const matchQuery = {
      $expr: {
        $and: [
          { $eq: [{ $year: "$date" }, year] },
          { $eq: [{ $month: "$date" }, month] },
        ],
      },
    };
    const allProfit = await paymentSaleModel.aggregate([
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "sales",
          localField: "saleId",
          foreignField: "_id",
          as: "saleInfo",
        },
      },
      { $unwind: "$saleInfo" },
      {
        $lookup: {
          from: "clients",
          localField: "saleInfo.clientId",
          foreignField: "_id",
          as: "clientInfo",
        },
      },
      { $unwind: "$clientInfo" },
      {
        $lookup: {
          from: "branchstocks",
          localField: "saleInfo.branchStockId",
          foreignField: "_id",
          as: "branchStockInfo",
        },
      },
      { $unwind: "$branchStockInfo" },
      {
        $lookup: {
          from: "stocks",
          localField: "branchStockInfo.stockId",
          foreignField: "_id",
          as: "stockInfo",
        },
      },
      { $unwind: "$stockInfo" },
      {
        $lookup: {
          from: "users",
          localField: "recipientId",
          foreignField: "_id",
          as: "recipientInfo",
        },
      },
      { $unwind: "$recipientInfo" },
      // {
      //   $addFields: {
      //     totalCost: {
      //       $first: ["$stockInfo.unitsCost"],
      //     },
      //   },
      // },
      {
        $group: {
          _id: "$saleId", // Group by saleId
          payments: { $push: "$$ROOT" }, // Push all payment documents into an array
          unitsCost: { $first: "$stockInfo.unitsCost" },
          salesQuantity: { $first: "$saleInfo.salesQuantity" },
          totalRecived: { $sum: "$amount" },
          totalPharmacy: {
            $sum: {
              $cond: [
                { $eq: ["$clientInfo.typeOfClient.id", 1] },
                "$amount",
                0,
              ],
            },
          },
          totalStore: {
            $sum: {
              $cond: [
                { $eq: ["$clientInfo.typeOfClient.id", 2] },
                "$amount",
                0,
              ],
            },
          },
          clientName: { $first: "$clientInfo.name" },
          clientId: { $first: "$clientInfo._id" },
          salesValue: { $first: "$saleInfo.salesValue" },
          itemName: { $first: "$stockInfo.itemName" },
          totalCost: {
            $first: {
              $multiply: ["$stockInfo.unitsCost", "$saleInfo.salesQuantity"],
            },
          },
        },
      },
    ]);

    // const totalBalance = sum(allProfit.map((profit) => profit.totalBalance));
    const totalPharmacy = sum(allProfit.map((profit) => profit.totalPharmacy));
    const totalStore = sum(allProfit.map((profit) => profit.totalStore));
    const totalRecived = sum(allProfit.map((profit) => profit.totalRecived));

    // const totalProfit = sum(allProfit.map((profit) => profit.profit));

    res.status(200).json({
      statusCode: 200,
      message: "Successfully",
      data: allProfit,
      totalRecived: totalRecived,
      totalPharmacy: totalPharmacy,
      totalStore: totalStore,
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
    const allProfit = await paymentSaleModel.aggregate([
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "sales",
          localField: "saleId",
          foreignField: "_id",
          as: "saleInfo",
        },
      },
      { $unwind: "$saleInfo" },
      {
        $lookup: {
          from: "clients",
          localField: "saleInfo.clientId",
          foreignField: "_id",
          as: "clientInfo",
        },
      },
      { $unwind: "$clientInfo" },
      {
        $lookup: {
          from: "branchstocks",
          localField: "saleInfo.branchStockId",
          foreignField: "_id",
          as: "branchStockInfo",
        },
      },
      { $unwind: "$branchStockInfo" },
      {
        $lookup: {
          from: "stocks",
          localField: "branchStockInfo.stockId",
          foreignField: "_id",
          as: "stockInfo",
        },
      },
      { $unwind: "$stockInfo" },
      {
        $lookup: {
          from: "users",
          localField: "recipientId",
          foreignField: "_id",
          as: "recipientInfo",
        },
      },
      { $unwind: "$recipientInfo" },
      // {
      //   $addFields: {
      //     totalCost: {
      //       $first: ["$stockInfo.unitsCost"],
      //     },
      //   },
      // },
      {
        $group: {
          _id: "$saleId", // Group by saleId
          payments: { $push: "$$ROOT" }, // Push all payment documents into an array
          unitsCost: { $first: "$stockInfo.unitsCost" },
          salesQuantity: { $first: "$saleInfo.salesQuantity" },
          totalRecived: { $sum: "$amount" },
          clientName: { $first: "$clientInfo.name" },
          clientId: { $first: "$clientInfo._id" },
          salesValue: { $first: "$saleInfo.salesValue" },
          itemName: { $first: "$stockInfo.itemName" },
          totalCost: {
            $first: {
              $multiply: ["$stockInfo.unitsCost", "$saleInfo.salesQuantity"],
            },
          }, // Calculate total cost
        },
      },
      // {
      //   $addFields: {
      //     profit: { $subtract: ["$totalRecived", "$totalCost"] }, // Calculate profit
      //     totalBalance: { $subtract: ["$salesValue", "$totalRecived"] }, // Calculate total balance
      //   },
      // },
    ]);

    // const totalBalance = sum(allProfit.map((profit) => profit.totalBalance));
    const totalRecived = sum(allProfit.map((profit) => profit.totalRecived));
    // const totalProfit = sum(allProfit.map((profit) => profit.profit));
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

    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: {
        totalCashAmountpaymentFactory: totalCashAmountpaymentFactory | 0,
        totalCashAmountServices: totalCashAmountServices | 0,
        totalCashAmountSalaries: totalCashAmountSalaries | 0,
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
    const allProfit = await paymentSaleModel.aggregate([
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "sales",
          localField: "saleId",
          foreignField: "_id",
          as: "saleInfo",
        },
      },
      { $unwind: "$saleInfo" },
      {
        $lookup: {
          from: "clients",
          localField: "saleInfo.clientId",
          foreignField: "_id",
          as: "clientInfo",
        },
      },
      { $unwind: "$clientInfo" },
      {
        $lookup: {
          from: "branchstocks",
          localField: "saleInfo.branchStockId",
          foreignField: "_id",
          as: "branchStockInfo",
        },
      },
      { $unwind: "$branchStockInfo" },
      {
        $lookup: {
          from: "stocks",
          localField: "branchStockInfo.stockId",
          foreignField: "_id",
          as: "stockInfo",
        },
      },
      { $unwind: "$stockInfo" },
      {
        $lookup: {
          from: "users",
          localField: "recipientId",
          foreignField: "_id",
          as: "recipientInfo",
        },
      },
      { $unwind: "$recipientInfo" },
      // {
      //   $addFields: {
      //     totalCost: {
      //       $first: ["$stockInfo.unitsCost"],
      //     },
      //   },
      // },
      {
        $group: {
          _id: "$saleId", // Group by saleId
          payments: { $push: "$$ROOT" }, // Push all payment documents into an array
          unitsCost: { $first: "$stockInfo.unitsCost" },
          salesQuantity: { $first: "$saleInfo.salesQuantity" },
          totalRecived: { $sum: "$amount" },
          clientName: { $first: "$clientInfo.name" },
          clientId: { $first: "$clientInfo._id" },
          salesValue: { $first: "$saleInfo.salesValue" },
          itemName: { $first: "$stockInfo.itemName" },
          totalCost: {
            $first: {
              $multiply: ["$stockInfo.unitsCost", "$saleInfo.salesQuantity"],
            },
          }, // Calculate total cost
        },
      },
      // {
      //   $addFields: {
      //     profit: { $subtract: ["$totalRecived", "$totalCost"] }, // Calculate profit
      //     totalBalance: { $subtract: ["$salesValue", "$totalRecived"] }, // Calculate total balance
      //   },
      // },
    ]);

    // const totalBalance = sum(allProfit.map((profit) => profit.totalBalance));
    const totalRecived = sum(allProfit.map((profit) => profit.totalRecived));
    // const totalProfit = sum(allProfit.map((profit) => profit.profit));
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

    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: {
        totalCashAmountpaymentFactory: totalCashAmountpaymentFactory | 0,
        totalCashAmountServices: totalCashAmountServices | 0,
        totalCashAmountSalaries: totalCashAmountSalaries | 0,
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
    const yearQuery = req.query.year
    const year = new Date(yearQuery).getFullYear();
    const matchQueryIncome = {
      $expr: {
        $eq: [{ $year: "$date" }, year],
      },
    };
    const allIncomes = await paymentSaleModel.aggregate([
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
          count: { $sum: 1 }, // Count the number of expenses for each month
        },
      },
    ]);
    const totalExpences = sum(
      allExpences.map((expences) => expences.totalAmount)
    );

    months.forEach((ele) => {
      if (!allIncomes.find((x) => x._id == ele)) {
        allIncomes.push({
          _id: ele,
          totalExpences: 0,
          totalPayments: 0,
          totalSalaries: 0,
          totalServices: 0,
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
