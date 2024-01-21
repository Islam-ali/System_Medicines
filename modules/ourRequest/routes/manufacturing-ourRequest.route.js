const express = require('express');
const router = express.Router();
const OurRequestService = require('../services/ourRequest.service');
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');
const validateOurRequest = require('../validation/ourRequest.validation');


// Create a new factory
router.post('/manufacturing/createOurRequest', verifyToken  , validateOurRequest ,OurRequestService.createOurRequest);

// Get all factories
router.get('/manufacturing/getAllOurRequests', verifyToken  ,OurRequestService.getAllOurRequests);

// Get a specific factory by ID
router.get('/manufacturing/getOurRequestById/:id', verifyToken  , OurRequestService.getOurRequestById );

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
router.put('/manufacturing/updateOurRequest/:id', verifyToken  , validateOurRequest , OurRequestService.updateOurRequest);

router.put(
  '/manufacturing/changeOrderStatus/:id' ,
  verifyToken,
  checkPermission("admin"),
  OurRequestService.changeOrderStatus
);


// Delete a factory by ID
router.delete('/manufacturing/deleteOurRequest/:id',  verifyToken  , OurRequestService.deleteOurRequest);

module.exports = router;