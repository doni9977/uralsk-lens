const Comment = require('../models/comment.model');

exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const comment = new Comment({ text, user: req.userId, photo: req.params.id });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) { next(err); }
};

exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ photo: req.params.id }).populate('user', 'username avatar');
    res.json(comments);
  } catch (err) { next(err); }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Not found' });

    if (
      String(comment.user) !== String(req.userId) &&
      req.userRole !== 'admin' 
    ) {
      return res.status(403).json({ message: 'Нет прав на удаление' });
    }
    await comment.deleteOne(); 
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};