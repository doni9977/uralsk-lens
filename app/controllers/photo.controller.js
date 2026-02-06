const Photo = require('../models/photo.model');

exports.createPhoto = async (req, res, next) => {
  try {
    const { title, description, category, lat, lng } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Image file required' });
    const imageUrl = `/uploads/${req.file.filename}`;
    const photo = new Photo({ title, description, category, imageUrl, location: { lat, lng }, user: req.userId });
    await photo.save();
    res.status(201).json(photo);
  } catch (err) {
    next(err);
  }
};

exports.getPhotos = async (req, res, next) => {
  try {
    const { category, q } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (q) filter.$text = { $search: q };
    const photos = await Photo.find(filter).populate('user', 'username avatar');
    res.json(photos);
  } catch (err) {
    next(err);
  }
};

exports.getPhotosMap = async (req, res, next) => {
  try {
    const photos = await Photo.find({ 'location.lat': { $exists: true }, 'location.lng': { $exists: true } }).select('title imageUrl location');
    res.json(photos);
  } catch (err) { next(err); }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Photo.distinct('category');
    res.json(categories);
  } catch (err) { next(err); }
};

exports.getPhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id).populate('user', 'username avatar');
    if (!photo) return res.status(404).json({ message: 'Not found' });
    res.json(photo);
  } catch (err) { next(err); }
};

exports.updatePhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Not found' });
    // only owner or admin
    if (photo.user.toString() !== req.userId && req.userRole !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { title, description, category } = req.body;
    if (title) photo.title = title;
    if (description) photo.description = description;
    if (category) photo.category = category;
    await photo.save();
    res.json(photo);
  } catch (err) { next(err); }
};

exports.deletePhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Not found' });
    if (photo.user.toString() !== req.userId && req.userRole !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    await photo.remove();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.likePhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Not found' });
    const idx = photo.likes.indexOf(req.userId);
    if (idx === -1) photo.likes.push(req.userId); else photo.likes.splice(idx, 1);
    await photo.save();
    res.json(photo);
  } catch (err) { next(err); }
};