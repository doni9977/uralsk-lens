const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/authJwt');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.post('/api/auth/register', [
  check('username').notEmpty().withMessage('Username required'),
  check('email')
    .isEmail().withMessage('Valid email required')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).withMessage('Email must contain @ and a dot after it'),
  check('password').isLength({ min: 6 }).withMessage('Password min 6 chars')
], validate, auth.register);

router.post('/api/auth/login', [
  check('email')
    .isEmail()
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).withMessage('Email must contain @ and a dot after it'),
  check('password').notEmpty()
], validate, auth.login);

router.get('/api/users/profile', verifyToken, auth.profile);

// NEW: Update user profile
router.put('/api/users/profile', [
  verifyToken,
  check('username').optional().notEmpty().withMessage('Username cannot be empty'),
  check('email').optional()
    .isEmail().withMessage('Valid email required')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).withMessage('Email must contain @ and a dot after it'),
  check('bio').optional().isString(),
  check('avatar').optional().isString()
], validate, auth.updateProfile);

module.exports = (app) => app.use('/', router);