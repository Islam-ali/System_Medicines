const express = require('express');
const router = express.Router();
const roleService = require('../services/role.service');
const {verifyToken,checkPermission} = require('../../../middelware/auth.middleware');


// Create a new role
router.post('/createRole', verifyToken ,checkPermission('user.create'), roleService.createRole);

// Get all roles
router.get('/getAllRoles', verifyToken ,checkPermission('user.read'),roleService.getAllRoles);

// Update a role by ID
router.put('/updateRole/:id', verifyToken ,checkPermission('user.update'), roleService.updateRole);

// Delete a role by ID
router.delete('/deleteRole/:id',  verifyToken ,checkPermission('user.delete'), roleService.deleteRole);

// Get all permission by Role Id
router.get('/getAllPermissionByRoleId/:id', verifyToken ,checkPermission('user.read'),roleService.getAllPermissionByRoleId);

router.put('/updatePermissionByRoleId/:id', verifyToken ,checkPermission('user.update'),roleService.updatePermissionByRoleId);




module.exports = router;