const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const album = require('../controllers/album.controller');
const { verifyToken, isRole } = require('../middlewares/authJwt');

const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	next();
};

router.post('/api/albums', [
	verifyToken,
	isRole('photographer','admin'),
	check('title').notEmpty().withMessage('Title required')
], validate, album.createAlbum);
router.get('/api/albums', album.getAlbums);
router.post('/api/albums/:id/add', [
	verifyToken,
	isRole('photographer','admin'),
	check('id').isMongoId().withMessage('Invalid album id'),
	check('photoId').isMongoId().withMessage('Invalid photo id')
], validate, album.addPhoto);

module.exports = (app) => app.use('/', router);