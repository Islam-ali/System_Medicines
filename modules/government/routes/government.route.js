const express = require('express');
const router = express.Router();
const government = require('../services/government.service');
const validateGovernment = require('../validation/government.validation')
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware')

router.get('/getAllGovernment' , verifyToken,government.getAllGovernment);

router.get('/getGovernmentById/:id' , verifyToken, checkPermission('user.read'),government.getGovernmentById);

router.post('/createGovernment' , verifyToken , checkPermission('user.read') ,validateGovernment, government.createGovernment);

router.put('/updateGovernment/:id' , verifyToken , checkPermission('user.read'),validateGovernment , government.updateGovernment);

router.delete('/deleteGovernment/:id' , verifyToken , checkPermission('user.read') , government.deleteGovernment);

module.exports = router;
