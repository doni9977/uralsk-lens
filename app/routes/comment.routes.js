const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const comment = require('../controllers/comment.controller');
const { verifyToken, isRole } = require('../middlewares/authJwt');

const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	next();
};

router.get('/api/photos/:id/comments', [
	check('id').isMongoId().withMessage('Invalid photo id')
], validate, comment.getComments);

router.post('/api/photos/:id/comments', [
	verifyToken,
	check('id').isMongoId().withMessage('Invalid photo id'),
	check('text').notEmpty().withMessage('Comment text required')
], validate, comment.addComment);

router.delete('/api/comments/:id', [
	verifyToken,
	isRole('admin'),
	check('id').isMongoId().withMessage('Invalid comment id')
], validate, comment.deleteComment);

module.exports = (app) => app.use('/', router);