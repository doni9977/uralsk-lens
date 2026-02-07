import { getAuthToken, logout, getProfile } from '../api/request.js';

export async function renderNavbar(container = document.querySelector('body')){
  const existing = container.querySelector('.topbar, .header');
  if (existing) existing.remove();

  const header = document.createElement('header');
  header.className = 'header';
  const token = getAuthToken();

  let navHTML = `
    <a class="logo" href="/client/index.html">Галерея Уральска</a>
    <nav>
      <ul>
        <li><a href="/client/index.html">Главная</a></li>
        <li><a href="/client/gellery.html">Галерея</a></li>
        <li><a href="/client/map.html">Карта</a></li>`;

  let showUpload = false;
  if (token) {
    try {
      const profile = await getProfile();
      if (profile.role === 'photographer' || profile.role === 'admin') {
        showUpload = true;
      }
      navHTML += showUpload ? `<li><a href="/client/photo.html">Загрузить</a></li>` : '';
      navHTML += `
        <li><a href="/client/profile.html">Профиль</a></li>
        <li class="nav-user">
          <span>${profile.username}</span>
          <button id="logoutBtn" class="btn-logout">Выход</button>
        </li>`;
    } catch {
      navHTML += `
        <li><a href="/client/login.html">Вход</a></li>
        <li><a href="/client/register.html">Регистрация</a></li>`;
    }
  } else {
    navHTML += `
      <li><a href="/client/login.html">Вход</a></li>
      <li><a href="/client/register.html">Регистрация</a></li>`;
  }

  navHTML += '</ul></nav>';
  header.innerHTML = navHTML;
  container.prepend(header);

  const logoutBtn = header.querySelector('#logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logout();
      window.location.href = '/client/index.html';
    });
  }
}
