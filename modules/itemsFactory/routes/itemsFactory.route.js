const express = require('express');
const router = express.Router();
const itemsFactoryService = require('../services/itemsFactory.service');
const {verifyToken,checkUserRole} = require('../../../middelware/auth.middleware');
const validateitemsFactory = require('../validation/itemsFactory.validation');


// Create a new factory
router.post('/createItemsFactory', verifyToken , checkUserRole('admin') , validateitemsFactory ,itemsFactoryService.createItemsFactory);

// Get all factories
router.get('/getAllItemsFactories', verifyToken , checkUserRole('admin') ,itemsFactoryService.getAllItemsFactories);

// Get a specific factory by ID
router.get('/getItemsFactoryById/:id', verifyToken , checkUserRole('admin') , itemsFactoryService.getItemsFactoryById );

// Get factories by TypeOfFactoryId
router.get('/getItemsFactoryByFactoryId/:factoryId', verifyToken , checkUserRole('admin') , itemsFactoryService.getItemsFactoryByFactoryId);

// Update a factory by ID
router.put('/updateItemsFactory/:id', verifyToken , checkUserRole('admin') , validateitemsFactory , itemsFactoryService.updateItemsFactory);

// Delete a factory by ID
router.delete('/deleteItemsFactory/:id',  verifyToken , checkUserRole('admin') , itemsFactoryService.deleteItemsFactory);

module.exports = router;