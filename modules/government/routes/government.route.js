const express = require('express');
const router = express.Router();
const government = require('../services/government.service');
const validateGovernment = require('../validation/government.validation')
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware')

router.get('/getAllGovernment' , verifyToken, checkPermission('user.create'),government.getAllGovernment);

router.get('/getGovernmentById/:id' , verifyToken, checkPermission('user.create'),government.getGovernmentById);

router.post('/createGovernment' , verifyToken , checkPermission('user.create') ,validateGovernment, government.createGovernment);

router.put('/updateGovernment/:id' , verifyToken , checkPermission('user.create'),validateGovernment , government.updateGovernment);

router.delete('/deleteGovernment/:id' , verifyToken , checkPermission('user.create') , government.deleteGovernment);


module.exports = router;
