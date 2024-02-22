const { sum } = require("lodash");
const expencesModel = require("../model/expences.model");

exports.getAllExpences = async (req, res, next) => {
  try {
    const queryDate = req.query.date;
    const year = new Date(queryDate).getFullYear();
    const month = new Date(queryDate).getMonth() + 1; // Months are zero-based, so add 1
    const matchQuery = {
      $expr: {
        $and: [
          { $eq: [{ $year: "$cashDate" }, year] },
          { $eq: [{ $month: "$cashDate" }, month] },
        ],
      },
    };
    const allExpences = await expencesModel.aggregate([
      {
        $match: matchQuery,
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
        $lookup: {
          from: "ourrequests",
          localField: "paymentFactoryId.ourRequestId",
          foreignField: "_id",
          as: "ourRequestId",
        },
      },
    ]);

    const totalCashAmount = sum(allExpences.map((income) => income.wasPaid));
    const totalBalance = sum(allExpences.map((income) => income.balance));

    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: allExpences,
      totalCashAmount: totalCashAmount,
      totalBalance: totalBalance,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};
