import { renderNavbar } from '../components/navbar.js';
import { login } from '../api/request.js';

renderNavbar(document.body);

const form = document.getElementById('loginForm');
form && form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = form.querySelector('input[name="email"]').value.trim();
  const password = form.querySelector('input[name="password"]').value;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    alert('Введите корректный email (например, name@domain.com)');
    return;
  }

  try {
    const data = await login(email, password);
    alert('Успешно вошли!');
    window.location.href = '/client/profile.html';
  } catch (err) {
    alert('Ошибка: ' + err.message);
  }
});
