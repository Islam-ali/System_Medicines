const express = require('express');
const router = express.Router();
const factoryService = require('../services/factory.service');
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');
const validateFactory = require('../validation/factory.validation');


// Create a new factory
router.post('/createFactory', verifyToken  , validateFactory ,factoryService.createFactory);

// Get all factories
router.get('/getAllFactories', verifyToken  ,factoryService.getAllFactories);

// Get a specific factory by ID
router.get('/getFactoryById/:id', verifyToken  , factoryService.getFactoryById );

// Get factories by TypeOfFactoryId
router.get('/getFactoriesByTypeOfFactoryId/:typeOfFactoryId', verifyToken  , factoryService.getFactoriesByTypeOfFactoryId);


// Get Factories By ClassificationId
router.get('/getFactoriesByClassificationId/:classificationId', verifyToken  , factoryService.getFactoriesByClassificationId);


// Update a factory by ID
router.put('/updateFactory/:id', verifyToken  , validateFactory , factoryService.updateFactory);

// Delete a factory by ID
router.delete('/deleteFactory/:id',  verifyToken  , factoryService.deleteFactory);

module.exports = router;