const express = require('express');
const router = express.Router();
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');
const wayOfPaymentService = require("../services/wayOfPayment.service");
// Get all classification
// Create a new wayOfPayment
router.post('/createwayOfPayment', verifyToken  ,wayOfPaymentService.createwayOfPayment);

// Get all factories
router.get('/getAllPaymentWay', verifyToken  ,wayOfPaymentService.getAllPaymentWay);

// Get a specific wayOfPayment by ID
router.get('/getwayOfPaymentById/:id', verifyToken  , wayOfPaymentService.getwayOfPaymentById );

// Update a wayOfPayment by ID
router.put('/updatewayOfPayment/:id', verifyToken  , wayOfPaymentService.updatewayOfPayment);

// Delete a wayOfPayment by ID
router.delete('/deletewayOfPayment/:id',  verifyToken  , wayOfPaymentService.deletewayOfPayment);


module.exports = router;