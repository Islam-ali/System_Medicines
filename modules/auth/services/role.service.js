const express = require("express");
const RoleModel = require("../model/role.model");
const PermissionModel = require("../model/permisiions.model");

exports.createRole = async (req, res) => {
  const { name } = req.body;
  const existingRole = await RoleModel.findOne({ name: name });
  if (existingRole) {
    return res.status(400).json({
      statusCode: res.statusCode,
      message: "Role already exists",
    });
  }
  try {
    await RoleModel.create({
      name,
      permissions: PermissionModel,
    });
    res.status(201).json({
      statusCode: res.statusCode,
      message: "create Role Successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await RoleModel.find();
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: roles,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const updatedRole = await RoleModel.findOne({ _id: req.params.id });
    if (!updatedRole) {
      return res
        .status(404)
        .json({
          message: "Role not found",
          data: [],
        });
    }
    updatedRole.name = req.body.name
    await updatedRole.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "update Role successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const deletedRole = await RoleModel.findByIdAndDelete(req.params.id);
    if (!deletedRole) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(201).json({
      statusCode: res.statusCode,
      message: "delete Role successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}



exports.getAllPermissionByRoleId =  async (req, res) => {
  try {
    const role = await RoleModel.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(200).json({
      statusCode: res.statusCode,
      message: "successfully",
      data: role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePermissionByRoleId = async (req, res) => {
  try {
    const updatedRole = await RoleModel.findOne({ _id: req.params.id });
    if (!updatedRole) {
      return res
        .status(404)
        .json({
          message: "Role not found",
          data: [],
        });
    }
    updatedRole.permissions = req.body.permissions
    await updatedRole.save();
    res.status(201).json({
      statusCode: res.statusCode,
      message: "update Permissions successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};