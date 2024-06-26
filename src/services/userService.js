const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { sendMedicEmail } = require('../utils/sendEmail');

const { sequelize } = require('../config/db');
const { createAdmin } = require('./adminService');

const User = require('../models/userModel');

async function createUser(req, res) {
  let transaction;
  let hashedPassword;
  let randomPassword = Math.random().toString(36).slice(-8);

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, role, password } = req.body;

    // Start a transaction for creating a new user
    transaction = await sequelize.transaction();

    // If the user is an admin, create a new record in the 'admin' table
    if (role === 'admin') {
      hashedPassword = await bcrypt.hash(password, 10);

      // Create a new record in the 'user' table
      const newAdminUser = await User.create(
        { email, password: hashedPassword, role },
        { transaction }
      );

      // Pass transaction to adminService
      await createAdmin(newAdminUser.id, transaction);

      // If the user is an admin, create a new record in the 'admin' table
    } else if (role === 'medic') {
      hashedPassword = await bcrypt.hash(randomPassword, 10);

      // Create a new record in the 'user' table
      const newMedicUser = await User.create(
        { email, password: hashedPassword, role },
        { transaction }
      );

      // Pass transaction to medicService
      // await createMedic(newMedicUser.id, transaction);

      // Send email with login credentials
      await sendMedicEmail(email, randomPassword);
    }

    // Commit the transaction
    await transaction.commit();

    return res.status(201).json({ message: 'User successfully created!' });
  } catch (error) {
    console.log('Error creating user:', error);

    // If an error occurrs, revert the transaction
    if (transaction) {
      await transaction.rollback();
    }

    // Unique constraint error
    if (error.parent && error.parent.code === '23505') {
      return res.status(400).json({ message: 'User already exists!' });
    }

    return res.status(500).json({ message: 'Internal server error.' });
  }
}

async function login(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed!' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Authentication failed!' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ message: 'Successfully logged in!', token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

async function findOne(req, res) {
  try {
    const id = parseInt(req.params.id);
    const user = await User.findByPk(id, {
      attributes: ['email', 'role', 'createdAt', 'updatedAt'],
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }
    return res.status(302).json({ user: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

async function findAll(_, res) {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'createdAt', 'updatedAt'],
    });
    if (!users) {
      return res.status(404).json({ message: 'Users not found!' });
    }

    return res.status(302).json({ users: users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function update(req, res) {
  let hasChanges = false;

  try {
    const id = parseInt(req.params.id);
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
    }

    const { newEmail, currentPassword, newPassword } = req.body;

    if (newEmail && newEmail !== user.email) {
      // Verify if the new email contains 'admin' and if the user is not an admin
      if (newEmail.includes('admin') && user.role !== 'admin') {
        return res
          .status(409)
          .json({
            message:
              "Non-admin users cannot have 'admin' in their email address.",
          });
      }

      // Verify if the email is already used by another user
      const emailExists = await User.findOne({
        where: { email: newEmail, id: { [Sequelize.Op.ne]: id } },
      });
      if (emailExists) {
        return res.status(409).json({ message: 'Email already in use!' });
      }

      // Update the user's email
      user.email = newEmail;
      hasChanges = true;
    }

    if (currentPassword && newPassword) {
      // Verify if the provided password matches with the one in the database
      const passwordMatch = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!passwordMatch) {
        return res
          .status(400)
          .json({ message: 'Your current password is incorrect!' });
      }

      // Hash the new password and update
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      hasChanges = true;
    }

    if (!hasChanges) {
      return res.status(200).json({ message: 'No changes detected.' });
    }

    await user.save();
    return res.status(200).json({ message: 'User successfully modified!' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function deleteOne(req, res) {
  try {
    const id = parseInt(req.params.id);
    const user = await User.destroy({ where: { id: id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    return res.status(200).json({ message: 'User successfully deleted!' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

module.exports = {
  createUser,
  login,
  findOne,
  findAll,
  update,
  deleteOne,
};
