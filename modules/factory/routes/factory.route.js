const express = require('express');
const router = express.Router();
const factoryService = require('../services/factory.service');
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');
const validateFactory = require('../validation/factory.validation');


// Create a new factory
router.post('/createFactory', verifyToken  ,checkPermission('factory.read'), validateFactory ,factoryService.createFactory);

// Get all factories
router.get('/getAllFactories', verifyToken  ,checkPermission('factory.read'),factoryService.getAllFactories);

// Get a specific factory by ID
router.get('/getFactoryById/:id', verifyToken  ,checkPermission('factory.read'), factoryService.getFactoryById );

// Get factories by TypeOfFactoryId
router.get('/getFactoriesByTypeOfFactoryId/:typeOfFactoryId', verifyToken  ,checkPermission('factory.read'), factoryService.getFactoriesByTypeOfFactoryId);


// Get Factories By ClassificationId
router.get('/getFactoriesByClassificationId/:classificationId', verifyToken  ,checkPermission('factory.read'), factoryService.getFactoriesByClassificationId);


// Update a factory by ID
router.put('/updateFactory/:id', verifyToken  ,checkPermission('factory.read'), validateFactory , factoryService.updateFactory);

// Delete a factory by ID
router.delete('/deleteFactory/:id',  verifyToken  ,checkPermission('factory.read'), factoryService.deleteFactory);

module.exports = router;