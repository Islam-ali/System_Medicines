const express = require('express');
const router = express.Router();
const OurRequestService = require('../services/ourRequest.service');
const {verifyToken,checkUserRole} = require('../../../middelware/auth.middleware');
const validateOurRequest = require('../validation/ourRequest.validation');


// Create a new factory
router.post('/createOurRequest', verifyToken , checkUserRole('admin') , validateOurRequest ,OurRequestService.createOurRequest);

// Get all factories
router.get('/getAllOurRequests', verifyToken , checkUserRole('admin') ,OurRequestService.getAllOurRequests);

// Get a specific factory by ID
router.get('/getOurRequestById/:id', verifyToken , checkUserRole('admin') , OurRequestService.getOurRequestById );

// // Get factories by TypeOfFactoryId
// // router.get('/getOurRequestByFactoryId/:factoryId', verifyToken , checkUserRole('admin') , OurRequestService.getOurRequestByFactoryId);

// Update a factory by ID
router.put('/updateOurRequest/:id', verifyToken , checkUserRole('admin') , validateOurRequest , OurRequestService.updateOurRequest);

router.put(
  "/changeOrderStatus/:id",
  verifyToken,
  checkUserRole("admin"),
  OurRequestService.changeOrderStatus
);


// Delete a factory by ID
router.delete('/deleteOurRequest/:id',  verifyToken , checkUserRole('admin') , OurRequestService.deleteOurRequest);

module.exports = router;