const typeOfFactoryModel = require("../model/typeOfFactory.model");

// get All type of Factories
exports.getTypeOfFactories = async (req, res, next) => {
  try {
    const allTypeOfFactory = await typeOfFactoryModel.find({});
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: allTypeOfFactory,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};
// create type of Factory
exports.createTypeOfFactory = async (req, res, next) => {
  const { type } = req.body;
  if (!type)
    return res
      .status(400)
      .json({ statusCode: res.statusCode, message: "type is Reqired" });
  try {
    const existingType = await typeOfFactoryModel.findOne({ type });
    if (existingType) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "type already exists",
      });
    }

    const newtypeOfFactory = new typeOfFactoryModel({ type });
    await newtypeOfFactory.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "created type Of Factory successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// update type of Factory
exports.updateTypeOfFactory = async (req, res, next) => {
  const { type } = req.body;
  if (!type)
    return res
      .status(400)
      .json({ statusCode: res.statusCode, message: "type is Reqired" });
  try {
    const existingType = await typeOfFactoryModel.findOne({ type });
    if (existingType) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "type already exists",
      });
    }
    const filter = { _id: req.body.id };
    const updateDocument = {
      $set: req.body,
    };
    await typeOfFactoryModel.updateOne(filter, updateDocument);
    res.status(201).json({
      statusCode: res.statusCode,
      message: "updated type Of Factory successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// Delete Type Of Factory
exports.deleteTypeOfFactory = async (req , res) => {
  try{
    const filter = { _id: req.params.id };
    const existingType = await typeOfFactoryModel.findOne(filter);
    if (!existingType) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "Not Found type Of Factory",
        data: filter
      });
    }
    await typeOfFactoryModel.deleteOne(filter);
    res.status(201).json({
      statusCode: res.statusCode,
      message: "deleted type Of Factory successfully",
    });
  }catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
}