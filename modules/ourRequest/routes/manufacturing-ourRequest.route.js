const express = require('express');
const router = express.Router();
const OurRequestService = require('../services/ourRequest.service');
const {verifyToken,checkUserRole} = require('../../../middelware/auth.middleware');
const validateOurRequest = require('../validation/ourRequest.validation');


// Create a new factory
router.post('/manufacturing/createOurRequest', verifyToken , checkUserRole('admin') , validateOurRequest ,OurRequestService.createOurRequest);

// Get all factories
router.get('/manufacturing/getAllOurRequests', verifyToken , checkUserRole('admin') ,OurRequestService.getAllOurRequests);

// Get a specific factory by ID
router.get('/manufacturing/getOurRequestById/:id', verifyToken , checkUserRole('admin') , OurRequestService.getOurRequestById );

// Get Our Request by FactoryId
router.get(
  "/getOurRequestByFactoryId/:factoryId",
  verifyToken,
  checkUserRole("admin"),
  OurRequestService.getOurRequestByFactoryId
);

// Get Our Request by itemsFactoryId
router.get(
  '/manufacturing/getOueRequestByItemsFactoryId/:itemsFactoryId',
  verifyToken,
  checkUserRole("admin"),
  OurRequestService.getOueRequestByItemsFactoryId
);

// Update a factory by ID
router.put('/manufacturing/updateOurRequest/:id', verifyToken , checkUserRole('admin') , validateOurRequest , OurRequestService.updateOurRequest);

router.put(
  '/manufacturing/changeOrderStatus/:id' ,
  verifyToken,
  checkUserRole("admin"),
  OurRequestService.changeOrderStatus
);


// Delete a factory by ID
router.delete('/manufacturing/deleteOurRequest/:id',  verifyToken , checkUserRole('admin') , OurRequestService.deleteOurRequest);

module.exports = router;