const express = require('express');
const router = express.Router();
const PaymentForFactoryService = require('../services/paymentForFactories.service');
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');
const validatePaymentForFactory = require('../validation/paymentForFactories.validtion');


// Create a new factory
router.post('/createPaymentForFactory', verifyToken  , validatePaymentForFactory ,PaymentForFactoryService.createPaymentForFactory);

// Get all factories
router.get('/getAllPaymentForFactories', verifyToken  ,PaymentForFactoryService.getAllPaymentForFactories);

// get All Payment For Our Request
router.get('/getAllPaymentForOurRequest', verifyToken  ,PaymentForFactoryService.getAllPaymentForOurRequest);

// Get a specific factory by ID
router.get('/getPaymentForFactoryById/:id', verifyToken  , PaymentForFactoryService.getPaymentForFactoryById );

// Get a Payment By FactoryId
router.get('/getPaymentByFactoryId/:factoryId', verifyToken  , PaymentForFactoryService.getPaymentByFactoryId );

// // Get factories by TypeOfFactoryId
// // router.get('/getPaymentForFactoryByFactoryId/:factoryId', verifyToken  , PaymentForFactoryService.getPaymentForFactoryByFactoryId);

// Update a factory by ID
router.put('/updatePaymentForFactory/:id', verifyToken  , validatePaymentForFactory , PaymentForFactoryService.updatePaymentForFactory);

// Delete a factory by ID
router.delete('/deletePaymentForFactory/:id',  verifyToken  , PaymentForFactoryService.deletePaymentForFactory);

module.exports = router;