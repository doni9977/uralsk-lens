import { renderNavbar } from '../components/navbar.js';
import { getAuthToken, getProfile, updateProfile } from '../api/request.js';

renderNavbar(document.body);

const token = getAuthToken();
if (!token) {
  window.location.href = '/client/login.html';
}

const el = document.getElementById('profileContent');
if (el) {
  async function loadProfile() {
    try {
      const user = await getProfile();
      
      el.innerHTML = `
        <div class="profile-card">
          <div class="profile-avatar">
            ${user.avatar ? `<img src="${user.avatar}" alt="Avatar">` : '<div class="avatar-placeholder">👤</div>'}
          </div>
          <div class="profile-info">
            <h2>${user.username}</h2>
            <p class="email">${user.email}</p>
            <p class="bio">${user.bio || 'Нет описания'}</p>
            <p class="role">Роль: ${user.role}</p>
          </div>
          <div class="profile-actions">
            <button id="editProfileBtn" class="btn">Редактировать профиль</button>
            <button id="uploadPhotoBtn" class="btn btn-primary">Загрузить фото</button>
          </div>
        </div>
        <div id="editForm" style="display:none;" class="edit-form">
          <h3>Редактировать профиль</h3>
          <form id="profileForm">
            <input type="text" name="username" placeholder="Имя пользователя" value="${user.username}">
            <input type="email" name="email" placeholder="Email" value="${user.email}">
            <textarea name="bio" placeholder="О себе">${user.bio || ''}</textarea>
            <input type="text" name="avatar" placeholder="URL аватара" value="${user.avatar || ''}">
            <button type="submit">Сохранить</button>
            <button type="button" id="cancelEdit">Отмена</button>
          </form>
        </div>
      `;

      const editProfileBtn = el.querySelector('#editProfileBtn');
      const uploadPhotoBtn = el.querySelector('#uploadPhotoBtn');
      const profileForm = el.querySelector('#profileForm');
      const editForm = el.querySelector('#editForm');
      const cancelBtn = el.querySelector('#cancelEdit');

      editProfileBtn.addEventListener('click', () => {
        editForm.style.display = editForm.style.display === 'none' ? 'block' : 'none';
      });

      cancelBtn.addEventListener('click', () => {
        editForm.style.display = 'none';
      });

      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(profileForm));
        try {
          await updateProfile(formData);
          alert('Профиль обновлен!');
          location.reload();
        } catch (err) {
          alert('Ошибка: ' + err.message);
        }
      });

      uploadPhotoBtn.addEventListener('click', () => {
        window.location.href = '/client/photo.html';
      });

    } catch (err) {
      el.innerHTML = `<p>Ошибка загрузки профиля: ${err.message}</p><p><a href="/client/login.html">Вернуться на вход</a></p>`;
    }
  }

  loadProfile();
}
