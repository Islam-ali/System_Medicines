const express = require('express');
const router = express.Router();
const {verifyToken,checkUserRole} = require('../../../middelware/auth.middleware');
const wayOfPayment = require('../model/wayOfPayment.model')

// Get all classification
router.get('/listOfwayOfPayment', verifyToken , checkUserRole('admin') , async (req,res)=>{
  const allwayOfPayment = await wayOfPayment;
  res.status(200).json({
    statusCode: res.statusCode,
    message: "successfully",
    data: allwayOfPayment,
  });
});

module.exports = router;