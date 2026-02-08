const Photo = require('../models/photo.model');

exports.getAlbums = async (req, res, next) => {
  try {
    const photos = await Photo.find({ likes: req.userId }).populate('user', 'username avatar');
    res.json({
      title: 'Liked photos',
      photos,
    });
  } catch (err) { next(err); }
};