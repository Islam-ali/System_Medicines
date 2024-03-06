const serviceModel = require("../model/dr-services.model");
const { validationResult } = require("express-validator");
const convertArray = require("../../../core/shared/errorForm");
const { sum } = require("lodash");
const expencesModel = require("../../expences/model/expences.model");

// get All type of Factories
exports.getAllServices = async (req, res, next) => {
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

    const allServices = await serviceModel.aggregate([
      {
        $lookup: {
          from: "doctors",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctorId",
        },
      },
      { $unwind: "$doctorId" },
      {
        $match: matchQuery,
      },
    ]);

    const totalServices = sum(allServices.map((service) => service.amount));

    res.status(200).json({
      statusCode: 200,
      message: "Successfully fetched all Service",
      data: allServices,
      totalServices: totalServices,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const objService = await serviceModel
      .findById(req.params.id)
      .populate("doctorId");
    if (!objService) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "service not Result",
        data: objService,
      });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: objService,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// create Payment Sale
exports.createService = async (req, res, next) => {
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

    await serviceModel.create(body).then(async (result) => {
      const objExpences = new expencesModel({
        typeExpences: "service",
        paymentFactoryId: null,
        salaryId: null,
        serviceId: result._id,
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
exports.updateService = async (req, res, next) => {
  const ServiceId = req.params.id;
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
    const objserviceModel = await serviceModel
      .findById(ServiceId)
      .populate("employeeId");
    if (!objserviceModel) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Salary not found",
      });
    }
    const updateDocument = {
      $set: body,
    };
    await serviceModel.updateOne({ _id: ServiceId }, updateDocument);
    const objExpences = {
      typeExpences: "service",
      paymentFactoryId: null,
      salaryId:null,
      amount: body.amount,
      cashDate: body.date,
    };
    await expencesModel.updateOne(
      {
        serviceId: req.params.id,
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
exports.deleteService = async (req, res) => {
  const ServiceId = req.params.id;
  try {
    const objserviceModel = await serviceModel
      .findById(ServiceId)
      .populate("employeeId");
    if (!objserviceModel) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "salary not found",
      });
    }

    await serviceModel.deleteOne({_id:req.params.id});
    await expencesModel.deleteOne({
      serviceId: req.params.id,
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
