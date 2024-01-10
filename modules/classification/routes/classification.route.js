const express = require('express');
const router = express.Router();
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');
const classifications = require('../model/classification.model');
const typeOfFactoryModel = require('../../typeOfFactory/model/typeOfFactory.model');


// Get all classification
router.get('/listOfClassifications', verifyToken , checkPermission('admin') , async (req,res)=>{
  const allClassifications = await classifications;
  res.status(200).json({
    statusCode: res.statusCode,
    message: "successfully",
    data: allClassifications,
  });
});

router.get('/listOflinks', verifyToken , checkPermission('admin') , async (req,res)=>{
  const allClassifications = await classifications;
  const allTypesFactories = await  typeOfFactoryModel.find({});
  const list = [];

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
});

module.exports = router;