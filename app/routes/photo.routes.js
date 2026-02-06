const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const photo = require('../controllers/photo.controller');
const { verifyToken } = require('../middlewares/authJwt');
const upload = require('../middlewares/upload.middleware');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.get('/api/photos/categories', photo.getCategories);
router.get('/api/photos/map', photo.getPhotosMap);
router.get('/api/photos', photo.getPhotos);
router.get('/api/photos/:id', [
  check('id').isMongoId().withMessage('Invalid photo id')
], validate, photo.getPhoto);

router.post('/api/photos', [
  verifyToken,
  upload.single('image'),
  check('title').notEmpty().withMessage('Title required')
], validate, photo.createPhoto);

router.put('/api/photos/:id', [
  verifyToken,
  check('id').isMongoId().withMessage('Invalid photo id'),
  check('title').optional().notEmpty().withMessage('Title cannot be empty')
], validate, photo.updatePhoto);

router.delete('/api/photos/:id', [
  verifyToken,
  check('id').isMongoId().withMessage('Invalid photo id')
], validate, photo.deletePhoto);

router.put('/api/photos/:id/like', [
  verifyToken,
  check('id').isMongoId().withMessage('Invalid photo id')
], validate, photo.likePhoto);

module.exports = (app) => app.use('/', router);