import { renderNavbar } from '../components/navbar.js';
import { register } from '../api/request.js';

renderNavbar(document.body);

const form = document.getElementById('registerForm');
form && form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = form.querySelector('input[name="username"]').value.trim();
  const email = form.querySelector('input[name="email"]').value.trim();
  const password = form.querySelector('input[name="password"]').value;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    alert('Введите корректный email (например, name@domain.com)');
    return;
  }

  try {
    await register(username, email, password);
    alert('Успешная регистрация! Перенаправление на вход...');
    window.location.href = '/client/login.html';
  } catch (err) {
    alert('Ошибка: ' + err.message);
  }
});
