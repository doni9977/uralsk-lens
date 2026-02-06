const Album = require('../models/album.model');

exports.createAlbum = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const album = new Album({ title, description, user: req.userId });
    await album.save();
    res.status(201).json(album);
  } catch (err) { next(err); }
};

exports.getAlbums = async (req, res, next) => {
  try {
    const albums = await Album.find().populate('photos');
    res.json(albums);
  } catch (err) { next(err); }
};

exports.addPhoto = async (req, res, next) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ message: 'Album not found' });
    album.photos.push(req.body.photoId);
    await album.save();
    res.json(album);
  } catch (err) { next(err); }
};