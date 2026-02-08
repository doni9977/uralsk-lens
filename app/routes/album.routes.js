const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const album = require('../controllers/album.controller');
const { verifyToken } = require('../middlewares/authJwt');

const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	next();
};

router.get('/api/albums', [
	verifyToken
], validate, album.getAlbums);

module.exports = (app) => app.use('/', router);