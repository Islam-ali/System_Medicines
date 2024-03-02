const express = require('express');
const router = express.Router();
const OurRequestService = require('../services/ourRequest.service');
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');
const validateOurRequest = require('../validation/ourRequest.validation');


// Create a new factory
router.post('/createOurRequest', verifyToken , checkPermission('ourRequest.create') , validateOurRequest ,OurRequestService.createOurRequest);

// Get all factories
router.get('/getAllOurRequests', verifyToken , checkPermission('ourRequest.read') ,OurRequestService.getAllOurRequests);

// Get a specific factory by ID
router.get('/getOurRequestById/:id', verifyToken , checkPermission('ourRequest.read') , OurRequestService.getOurRequestById );

// Get Our Request by FactoryId
// router.get(
//   "/getOurRequestByFactoryId/:factoryId",
//   verifyToken,
//   checkPermission("ourRequest.read"),
//   OurRequestService.getOurRequestByFactoryId
// );

// Get Our Request by itemsFactoryId
router.get(
  "/getOueRequestByItemsFactoryId/:itemsFactoryId",
  verifyToken,
  checkPermission("ourRequest.read"),
  OurRequestService.getOueRequestByItemsFactoryId
);

// Update a factory by ID
router.put('/updateOurRequest/:id', verifyToken , checkPermission('ourRequest.update') , validateOurRequest , OurRequestService.updateOurRequest);

router.put(
  "/changeOrderStatus/:id",
  verifyToken,
  checkPermission("ourRequest.update"),
  OurRequestService.changeOrderStatus
);


// Delete a factory by ID
router.delete('/deleteOurRequest/:id',  verifyToken , checkPermission('ourRequest.delete') , OurRequestService.deleteOurRequest);

module.exports = router;