const express = require('express');
const router = express.Router();
const client = require('../services/client.service');
const validateclient = require('../validation/client.validation')
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware')

router.get('/getAllClient' , verifyToken, checkPermission('user.create'),client.getAllClient);

router.get('/getClientsByTypeOfClientId/:typeOfClientId' , verifyToken, checkPermission('user.create'),client.getClientsByTypeOfClientId);

router.get('/getClientById/:id' , verifyToken, checkPermission('user.create'),client.getClientById);

router.post('/createClient' , verifyToken , checkPermission('user.create') ,validateclient, client.createClient);

router.put('/updateClient/:id' , verifyToken , checkPermission('user.create'),validateclient , client.updateClient);

router.delete('/deleteClient/:id' , verifyToken , checkPermission('user.create') , client.deleteClient);


module.exports = router;
