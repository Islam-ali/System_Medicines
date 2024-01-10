const express = require('express');
const router = express.Router();
const PaymentForFactoryService = require('../services/paymentForFactories.service');
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');
const validatePaymentForFactory = require('../validation/paymentForFactories.validtion');


// Create a new factory
router.post('/createPaymentForFactory', verifyToken , checkPermission('admin') , validatePaymentForFactory ,PaymentForFactoryService.createPaymentForFactory);

// Get all factories
router.get('/getAllPaymentForFactories', verifyToken , checkPermission('admin') ,PaymentForFactoryService.getAllPaymentForFactories);

// get All Payment For Our Request
router.get('/getAllPaymentForOurRequest', verifyToken , checkPermission('admin') ,PaymentForFactoryService.getAllPaymentForOurRequest);

// Get a specific factory by ID
router.get('/getPaymentForFactoryById/:id', verifyToken , checkPermission('admin') , PaymentForFactoryService.getPaymentForFactoryById );

// Get a Payment By FactoryId
router.get('/getPaymentByFactoryId/:factoryId', verifyToken , checkPermission('admin') , PaymentForFactoryService.getPaymentByFactoryId );

// // Get factories by TypeOfFactoryId
// // router.get('/getPaymentForFactoryByFactoryId/:factoryId', verifyToken , checkPermission('admin') , PaymentForFactoryService.getPaymentForFactoryByFactoryId);

// Update a factory by ID
router.put('/updatePaymentForFactory/:id', verifyToken , checkPermission('admin') , validatePaymentForFactory , PaymentForFactoryService.updatePaymentForFactory);

// Delete a factory by ID
router.delete('/deletePaymentForFactory/:id',  verifyToken , checkPermission('admin') , PaymentForFactoryService.deletePaymentForFactory);

module.exports = router;