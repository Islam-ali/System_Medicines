const { sum } = require("lodash");
const expencesModel = require("../../expences/model/expences.model");
const paymentClient = require("../../paymentClient/model/paymentClient.model");
const paymentClientModel = require("../../paymentClient/model/paymentClient.model");

exports.getStatsticsAcountInYear = async (req, res, next) => {
  try {
    const year = new Date().getFullYear();
    const matchQueryIncome = {
      $expr: {
        $and: [{ $eq: [{ $year: "$date" }, year] }],
      },
      
    };
    const allIncomes = await paymentClient.aggregate([
      {
        $match: matchQueryIncome,
      }
    ]);

    const totalRecived = sum(allIncomes.map((income) => income.amount));

    const matchQueryExpences = {
      $expr: {
        $and: [{ $eq: [{ $year: "$cashDate" }, year] }],
      },
    };
    const allExpences = await expencesModel.aggregate([
      {
        $match: matchQueryExpences,
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

    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: {
        totalCashAmountpaymentFactory: totalCashAmountpaymentFactory | 0,
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

exports.getStatsticsAcountInMonth = async (req, res, next) => {
  try {
    const month = new Date().getMonth() + 1;
    const matchQueryIncome = {
      $expr: {
        $eq: [{ $month: "$date" }, month],
      },
    };
    const allIncomes = await paymentClientModel.aggregate([
      {
        $match: matchQueryIncome,
      }
    ]);

    const totalRecived = sum(allIncomes.map((income) => income.amount));

    const matchQueryExpences = {
      $expr: {
        $and: [{ $eq: [{ $month: "$cashDate" }, month] }],
      },
    };
    const allExpences = await expencesModel.aggregate([
      {
        $match: matchQueryExpences,
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

    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: {
        totalCashAmountpaymentFactory: totalCashAmountpaymentFactory | 0,
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

exports.getStatsticsAccountGroupbyYear = async (req, res, next) => {
  try {
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const year = new Date().getFullYear();

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
          _id: { $month: "$cashDate" }, // Group by month
          totalAmount: { $sum: "$amount" }, // Calculate total amount for each month
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
          totalRecived: 0,
          count: 0,
        });
      }
      if (!allExpences.find((x) => x._id == ele)) {
        allExpences.push({
          _id: ele,
          totalAmount: 0,
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

// exports.getStatsticsAcountInYear = async (req, res, next) => {
//   try {
//     const year = new Date().getFullYear();
//     const matchQueryIncome = {
//       $expr: {
//         $and: [{ $eq: [{ $year: "$date" }, year] }],
//       },
//     };
//     const allProfit = await paymentSaleModel.aggregate([
//       {
//         $match: matchQueryIncome,
//       },
//       {
//         $group: {
//           _id: "$saleId",
//           payments: { $push: "$$ROOT" },
//           totalRecived: { $sum: "$amount" },
//         },
//       },
//     ]);

//     const totalRecived = sum(allProfit.map((profit) => profit.totalRecived));

//     const matchQueryExpences = {
//       $expr: {
//         $and: [{ $eq: [{ $year: "$cashDate" }, year] }],
//       },
//     };
//     const allExpences = await expencesModel.aggregate([
//       {
//         $match: matchQueryExpences,
//       },
//     ]);

//     const totalCashAmount = sum(allExpences.map((income) => income.amount));

//     const totalCashAmountpaymentFactory = allExpences.reduce((sum, item) => {
//       if (item.typeExpences === "FactoryPayment") {
//         return sum + item.amount;
//       }
//       return sum;
//     }, 0);

//     const totalCashAmountSalaries = allExpences.reduce((sum, item) => {
//       if (item.typeExpences === "salary") {
//         return sum + item.amount;
//       }
//       return sum;
//     }, 0);

//     res.status(200).json({
//       statusCode: res.statusCode,
//       message: "successfully",
//       data: {
//         totalCashAmountpaymentFactory: totalCashAmountpaymentFactory | 0,
//         totalCashAmountSalaries: totalCashAmountSalaries | 0,
//         totalCashAmount: totalCashAmount | 0,
//         totalRecived: totalRecived | 0,
//         profit: totalRecived - totalCashAmount,
//       },
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ statusCode: res.statusCode, message: error.message });
//   }
// };