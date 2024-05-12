const { sum } = require("lodash");
const expencesModel = require("../model/expences.model");

exports.getAllExpences = async (req, res, next) => {
  try {
    // const queryDate = req.query.date;
    // const year = new Date(queryDate).getFullYear();
    // const month = new Date(queryDate).getMonth() + 1;
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;
    let matchQuery = {};
    if (fromDate && toDate) {
      matchQuery["cashDate"] = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }
    // const matchQuery = {
    //   $expr: {
    //     $and: [
    //       { $eq: [{ $year: "$cashDate" }, year] },
    //       { $eq: [{ $month: "$cashDate" }, month] },
    //     ],
    //   },
    // };
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
          withService: [
            {
              $match: {
                serviceId: { $exists: true },
              },
            },
            {
              $lookup: {
                from: "services",
                localField: "serviceId",
                foreignField: "_id",
                as: "serviceId",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "serviceId.doctorId",
                foreignField: "_id",
                as: "doctorId",
              },
            },
          ],
          withoutService: [
            {
              $match: {
                serviceId: { $exists: false },
              },
            },
          ],
        },
      },
      {
        $project: {
          services: {
            $concatArrays: ["$withService", "$withoutService"],
          },
        },
      },
      {
        $unwind: "$services",
      },
      {
        $replaceRoot: { newRoot: "$services" },
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

    const totalCashAmount = sum(allExpences.map((expence) => expence.amount));

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
      data: allExpences,
      totalCashAmountpaymentFactory: totalCashAmountpaymentFactory | 0,
      totalCashAmountServices: totalCashAmountServices | 0,
      totalCashAmountSalaries: totalCashAmountSalaries | 0,
      totalCashAmountOtherService: totalCashAmountOtherService | 0,
      totalCashAmount: totalCashAmount | 0,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};
