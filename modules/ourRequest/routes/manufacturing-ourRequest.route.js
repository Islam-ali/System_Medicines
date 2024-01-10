const express = require('express');
const router = express.Router();
const OurRequestService = require('../services/ourRequest.service');
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');
const validateOurRequest = require('../validation/ourRequest.validation');


// Create a new factory
router.post('/manufacturing/createOurRequest', verifyToken , checkPermission('admin') , validateOurRequest ,OurRequestService.createOurRequest);

// Get all factories
router.get('/manufacturing/getAllOurRequests', verifyToken , checkPermission('admin') ,OurRequestService.getAllOurRequests);

// Get a specific factory by ID
router.get('/manufacturing/getOurRequestById/:id', verifyToken , checkPermission('admin') , OurRequestService.getOurRequestById );

// Get Our Request by FactoryId
router.get(
  "/getOurRequestByFactoryId/:factoryId",
  verifyToken,
  checkPermission("admin"),
  OurRequestService.getOurRequestByFactoryId
);

// Get Our Request by itemsFactoryId
router.get(
  '/manufacturing/getOueRequestByItemsFactoryId/:itemsFactoryId',
  verifyToken,
  checkPermission("admin"),
  OurRequestService.getOueRequestByItemsFactoryId
);

// Update a factory by ID
router.put('/manufacturing/updateOurRequest/:id', verifyToken , checkPermission('admin') , validateOurRequest , OurRequestService.updateOurRequest);

router.put(
  '/manufacturing/changeOrderStatus/:id' ,
  verifyToken,
  checkPermission("admin"),
  OurRequestService.changeOrderStatus
);


// Delete a factory by ID
router.delete('/manufacturing/deleteOurRequest/:id',  verifyToken , checkPermission('admin') , OurRequestService.deleteOurRequest);

module.exports = router;