const sendEmail = require('../utils/email');

exports.subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ message:'Please provide a valid email address.' });
    }

    await sendEmail({
      email: email,
      subject: 'Подписка на рассылку Uralsk-Lens',
      message: 'Спасибо за подписку на нашу рассылку! Теперь вы будете получать обновления о нашем фотопортфолио.'
    });

    res.status(200).json({ message: 'Subscription successful.' });
  } catch (err) {
    next(err);
  }
};