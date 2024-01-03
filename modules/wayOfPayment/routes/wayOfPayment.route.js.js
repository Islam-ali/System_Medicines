const express = require('express');
const router = express.Router();
const {verifyToken,checkUserRole} = require('../../../middelware/auth.middleware');
const wayOfPaymentService = require("../services/wayOfPayment.service");
// Get all classification
// Create a new wayOfPayment
router.post('/createwayOfPayment', verifyToken , checkUserRole('admin') ,wayOfPaymentService.createwayOfPayment);

// Get all factories
router.get('/getAllPaymentWay', verifyToken , checkUserRole('admin') ,wayOfPaymentService.getAllPaymentWay);

// Get a specific wayOfPayment by ID
router.get('/getwayOfPaymentById/:id', verifyToken , checkUserRole('admin') , wayOfPaymentService.getwayOfPaymentById );

// Update a wayOfPayment by ID
router.put('/updatewayOfPayment/:id', verifyToken , checkUserRole('admin') , wayOfPaymentService.updatewayOfPayment);

// Delete a wayOfPayment by ID
router.delete('/deletewayOfPayment/:id',  verifyToken , checkUserRole('admin') , wayOfPaymentService.deletewayOfPayment);


module.exports = router;