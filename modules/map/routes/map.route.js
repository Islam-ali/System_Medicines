const MapLocationModel = require("../model/map.model");
const express = require("express");
const router = express.Router();

// Create a new location
router.post("/location", async (req, res,next) => {
  try {
    await MapLocationModel.create(req.body);
    return res.status(201).json({
      statusCode: res.statusCode,
      message: "successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all location
router.get("/locations", async(req , res ) => {
      try {
        const listOfMapLocation = await MapLocationModel.find({})
        res.status(200).json({
          statusCode: res.statusCode,
          message: "successfully",
          data: listOfMapLocation,
        });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
});


module.exports = router;
