const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../controllers/auth.controller');
const { verifyToken, isRole } = require('../middlewares/authJwt');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.post('/api/auth/register', [
  check('username').notEmpty().withMessage('Username required'),
  check('email').isEmail().withMessage('Valid email required'),
  check('password').isLength({ min: 6 }).withMessage('Password min 6 chars')
], validate, auth.register);

router.post('/api/auth/login', [
  check('email').isEmail(),
  check('password').notEmpty()
], validate, auth.login);

router.get('/api/users/profile', verifyToken, auth.profile);

router.put('/api/users/profile', [
  verifyToken,
  check('username').optional().notEmpty(),
  check('email').optional().isEmail()
], validate, auth.updateProfile);

router.get('/api/users', [verifyToken, isRole('admin')], async (req, res, next) => {
  try {
    const User = require('../models/user.model');
    const users = await User.find().select('-password'); 
    res.json(users);
  } catch (err) { next(err); }
});

router.put('/api/users/:id/set-photographer', [
  verifyToken,
  isRole('admin'),
  check('id').isMongoId().withMessage('Invalid user id')
], async (req, res, next) => {
  try {
    const User = require('../models/user.model');
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = 'photographer';
    await user.save();
    res.json({ message: 'Role updated to photographer', user });
  } catch (err) { next(err); }
});

module.exports = (app) => app.use('/', router);