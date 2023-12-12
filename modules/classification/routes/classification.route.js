const express = require('express');
const router = express.Router();
const {verifyToken,checkUserRole} = require('../../../middelware/auth.middleware');
const classifications = require('../model/classification.model')

// Get all classification
router.get('/listOfClassifications', verifyToken , checkUserRole('admin') , async (req,res)=>{
  const allClassifications = await classifications;
  res.status(200).json({
    statusCode: res.statusCode,
    message: "successfully",
    data: allClassifications,
  });
});

module.exports = router;