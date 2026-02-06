const express = require('express');
const router = express.Router();
const comment = require('../controllers/comment.controller');
const { verifyToken } = require('../middlewares/authJwt');

router.get('/api/photos/:id/comments', comment.getComments);
router.post('/api/photos/:id/comments', verifyToken, comment.addComment);
router.delete('/api/comments/:id', verifyToken, comment.deleteComment);

module.exports = (app) => app.use('/', router);