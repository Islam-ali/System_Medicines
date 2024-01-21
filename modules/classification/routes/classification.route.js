const express = require('express');
const router = express.Router();
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');
const classifications = require('../model/classification.model');
const typeOfFactoryModel = require('../../typeOfFactory/model/typeOfFactory.model');


// Get all classification
router.get('/listOfClassifications', verifyToken  , async (req,res)=>{
  const allClassifications = await classifications;
  res.status(200).json({
    statusCode: res.statusCode,
    message: "successfully",
    data: allClassifications,
  });
});

router.get('/listOflinks', verifyToken  , async (req,res)=>{
  const allClassifications = await classifications;
  const allTypesFactories = await  typeOfFactoryModel.find({});
  let list = [];
  try{
    allClassifications.forEach((element, index) => {
      list.push({
        classificationName:element.name,
        classificationId:element.id,
        listOfTypes:allTypesFactories.filter(item => item.classificationId == element.id).map(item => ({ type: item.type, _id: item._id }))
      })
    });
  
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: list,
    });
  } catch(error){
    res.status(500).json({
      statusCode: res.statusCode,
      message: "Failed to create sale",
      error: error.message,
    });
  }
});

module.exports = router;