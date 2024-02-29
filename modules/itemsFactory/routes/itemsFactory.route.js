const express = require('express');
const router = express.Router();
const itemsFactoryService = require('../services/itemsFactory.service');
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');
const validateitemsFactory = require('../validation/itemsFactory.validation');


// Create a new factory
router.post(
  "/createItemsFactory",
  verifyToken,
  checkPermission("itemFactory.create"),
  validateitemsFactory,
  itemsFactoryService.createItemsFactory
);

// Get all factories
router.get(
  "/getAllItemsFactories",
  verifyToken,
  checkPermission("itemFactory.read"),
  itemsFactoryService.getAllItemsFactories
);

// Get a specific factory by ID
router.get('/getItemsFactoryById/:id', verifyToken  , checkPermission('itemFactory.read') , itemsFactoryService.getItemsFactoryById );

// Get factories by TypeOfFactoryId
router.get('/getItemsFactoryByFactoryId/:factoryId', verifyToken  , checkPermission('itemFactory.read') , itemsFactoryService.getItemsFactoryByFactoryId);

// Update a factory by ID
router.put(
  "/updateItemsFactory/:id",
  verifyToken,
  checkPermission("itemFactory.update"),
  validateitemsFactory,
  itemsFactoryService.updateItemsFactory
);

// Delete a factory by ID
router.delete(
  "/deleteItemsFactory/:id",
  verifyToken,
  checkPermission("itemFactory.delete"),
  itemsFactoryService.deleteItemsFactory
);

module.exports = router;