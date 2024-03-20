const treasurModel = require("../model/treasur.model");

// get All type of Factories
exports.getAllTreasur = async (req, res, next) => {
  try {
    const allTreasur = await treasurModel.find({});
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: allTreasur,
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};
// create Treasur
exports.createTreasur = async (req, res, next) => {
  try {
    const newTreasur = new treasurModel(req.body);
    await newTreasur.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "created successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// update Treasur
exports.updateTreasur = async (req, res, next) => {
  try {
    const exist = await treasurModel.findOne({
      _id: req.params.id,
    });
    if (!exist) {
      return res.status(400).json({
        statusCode: res.statusCode,
        message: "not exist Treasur",
      });
    }

    const filter = { _id: req.params.id };
    const updateDocument = {
      $set: req.body,
    };
    await treasurModel.updateOne(filter, updateDocument);
    res.status(201).json({
      statusCode: res.statusCode,
      message: "updated Treasur successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};

// Delete Treasur
exports.deleteTreasur = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const existingType = await treasurModel.findOne(filter);
    if (!existingType) {
      return res.status(404).json({
        statusCode: res.statusCode,
        message: "Not Found Treasur",
      });
    }
    await treasurModel.deleteOne(filter);
    res.status(201).json({
      statusCode: res.statusCode,
      message: "deleted Treasur successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: res.statusCode, message: error.message });
  }
};
