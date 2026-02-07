const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    // Если роль не передана, по умолчанию ставим 'viewer'
    const user = new User({ 
        username, 
        email, 
        password, 
        role: role || 'viewer' 
    });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'User already exists' });
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // 1. Ищем пользователя
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    // 2. Проверяем пароль
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    
    // 3. Создаем токен
    const token = jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET || 'CHANGE_ME', 
        { expiresIn: '7d' }
    );
    
    // 4. ГЛАВНОЕ ИСПРАВЛЕНИЕ: Отправляем user вместе с токеном
    res.json({ 
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role // <--- Именно это нужно фронтенду
        }
    });
  } catch (err) {
    next(err);
  }
};

exports.profile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { username, email, bio, avatar } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) return res.status(400).json({ message: 'Username already taken' });
      user.username = username;
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }

    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ message: 'Profile updated', user: userObj });
  } catch (err) {
    next(err);
  }
};