
const express = require('express');
const router = express.Router();
const album = require('../controllers/album.controller');
const { verifyToken } = require('../middlewares/authJwt');

router.post('/api/albums', verifyToken, album.createAlbum);
router.get('/api/albums', album.getAlbums);
router.post('/api/albums/:id/add', verifyToken, album.addPhoto);

module.exports = (app) => app.use('/', router);