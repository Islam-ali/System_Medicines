const express = require('express');
const router = express.Router();
const PaymentForFactoryService = require('../services/paymentForFactories.service');
const {verifyToken,checkUserRole} = require('../../../middelware/auth.middleware');
const validatePaymentForFactory = require('../validation/paymentForFactories.validtion');


// Create a new factory
router.post('/createPaymentForFactory', verifyToken , checkUserRole('admin') , validatePaymentForFactory ,PaymentForFactoryService.createPaymentForFactory);

// Get all factories
router.get('/getAllPaymentForFactories', verifyToken , checkUserRole('admin') ,PaymentForFactoryService.getAllPaymentForFactories);

// get All Payment For Our Request
router.get('/getAllPaymentForOurRequest', verifyToken , checkUserRole('admin') ,PaymentForFactoryService.getAllPaymentForOurRequest);

// Get a specific factory by ID
router.get('/getPaymentForFactoryById/:id', verifyToken , checkUserRole('admin') , PaymentForFactoryService.getPaymentForFactoryById );

// // Get factories by TypeOfFactoryId
// // router.get('/getPaymentForFactoryByFactoryId/:factoryId', verifyToken , checkUserRole('admin') , PaymentForFactoryService.getPaymentForFactoryByFactoryId);

// Update a factory by ID
router.put('/updatePaymentForFactory/:id', verifyToken , checkUserRole('admin') , validatePaymentForFactory , PaymentForFactoryService.updatePaymentForFactory);

// Delete a factory by ID
router.delete('/deletePaymentForFactory/:id',  verifyToken , checkUserRole('admin') , PaymentForFactoryService.deletePaymentForFactory);

module.exports = router;