const express = require('express');
const router = express.Router();
const itemsFactoryService = require('../services/itemsFactory.service');
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');
const validateitemsFactory = require('../validation/itemsFactory.validation');


// Create a new factory
router.post('/createItemsFactory', verifyToken  , validateitemsFactory ,itemsFactoryService.createItemsFactory);

// Get all factories
router.get('/getAllItemsFactories', verifyToken  ,itemsFactoryService.getAllItemsFactories);

// Get a specific factory by ID
router.get('/getItemsFactoryById/:id', verifyToken  , itemsFactoryService.getItemsFactoryById );

// Get factories by TypeOfFactoryId
router.get('/getItemsFactoryByFactoryId/:factoryId', verifyToken  , itemsFactoryService.getItemsFactoryByFactoryId);

// Update a factory by ID
router.put('/updateItemsFactory/:id', verifyToken  , validateitemsFactory , itemsFactoryService.updateItemsFactory);

// Delete a factory by ID
router.delete('/deleteItemsFactory/:id',  verifyToken  , itemsFactoryService.deleteItemsFactory);

module.exports = router;