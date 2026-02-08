import { renderNavbar } from '../components/navbar.js';
import { getAuthToken, getProfile, updateProfile, getAlbums } from '../api/request.js';
import { createCard } from '../components/card.js';

renderNavbar(document.body);

const token = getAuthToken();
if (!token) {
  window.location.href = '/client/login.html';
}

const el = document.getElementById('profileContent');

async function loadProfile() {
  if (!el) return;
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
          <p class="role">Роль: <span id="myRoleTag"><b>${user.role}</b></span></p>
        </div>
        <div class="profile-actions">
          <button id="editProfileBtn" class="btn">Редактировать профиль</button>
          ${(user.role === 'photographer' || user.role === 'admin') ? 
            '<button id="uploadPhotoBtn" class="btn btn-primary">Загрузить фото</button>' : ''}
        </div>
      </div>

      <div id="editForm" style="display:none;" class="edit-form">
        <h3>Редактировать профиль</h3>
        <form id="profileForm">
          <input type="text" name="username" placeholder="Имя пользователя" value="${user.username}">
          <input type="email" name="email" placeholder="Email" value="${user.email}">
          <textarea name="bio" placeholder="О себе">${user.bio || ''}</textarea>
          <input type="text" name="avatar" placeholder="URL аватара" value="${user.avatar || ''}">
          <button type="submit" class="btn-primary">Сохранить</button>
          <button type="button" id="cancelEdit" class="btn">Отмена</button>
        </form>
      </div>
      
      <div id="adminArea" style="margin-top: 40px;"></div> 
    `;

    setupEventListeners(el, user);

    if (user.role === 'admin') {
      renderAdminUserList();
    }

  } catch (err) {
    el.innerHTML = `<p>Ошибка: ${err.message}</p>`;
  }
}

function setupEventListeners(container, user) {
  const editProfileBtn = container.querySelector('#editProfileBtn');
  const editForm = container.querySelector('#editForm');
  const profileForm = container.querySelector('#profileForm');

  editProfileBtn.onclick = () => editForm.style.display = 'block';
  container.querySelector('#cancelEdit').onclick = () => editForm.style.display = 'none';

  profileForm.onsubmit = async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(profileForm));
    try {
      await updateProfile(formData);
      alert('Профиль обновлен!');
      location.reload();
    } catch (err) { alert('Ошибка: ' + err.message); }
  };

  const uploadBtn = container.querySelector('#uploadPhotoBtn');
  if (uploadBtn) {
    uploadBtn.onclick = () => window.location.href = '/client/photo.html';
  }
}


async function renderAdminUserList() {
  const adminArea = document.getElementById('adminArea');
  if (!adminArea) return;

  try {

    const res = await fetch('http://localhost:8080/api/users', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
    });
    
    if (!res.ok) throw new Error('Не удалось загрузить пользователей');
    const users = await res.json();

    adminArea.innerHTML = `
      <h2 style="border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px;">
        Управление пользователями
      </h2>
    `;

    const listContainer = document.createElement('div');
    listContainer.className = 'admin-user-list';

    users.forEach(u => {
      const row = document.createElement('div');
      row.style.cssText = `
        display: flex; 
        align-items: center; 
        justify-content: space-between; 
        padding: 15px; 
        border-bottom: 1px solid #f0f0f0;
        background: #fff;
      `;
      
      row.innerHTML = `
        <div>
          <strong style="font-size: 16px;">${u.username}</strong> 
          <span style="color: #666;">(${u.email})</span>
          <br>
          <small>Роль: <b class="role-display">${u.role}</b></small>
        </div>
      `;

      if (u.role === 'viewer') {
        const btn = document.createElement('button');
        btn.textContent = 'Сделать фотографом';
        btn.style.cssText = `
          background: #1976d2; 
          color: #white; 
          border: none; 
          padding: 8px 15px; 
          border-radius: 5px; 
          cursor: pointer;
          font-weight: bold;
        `;
        
        btn.onclick = async () => {
          if (!confirm(`Назначить ${u.username} фотографом?`)) return;
          
          try {
            const resp = await fetch(`http://localhost:8080/api/users/${u._id}/set-photographer`, {
              method: 'PUT', 
              headers: { 
                'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
                'Content-Type': 'application/json'
              }
            });

            if (resp.ok) {
              row.querySelector('.role-display').textContent = 'photographer';
              btn.remove(); 
              alert('Пользователь повышен!');
            } else {
              alert('Ошибка сервера при смене роли');
            }
          } catch (e) { console.error(e); }
        };
        row.appendChild(btn);
      }

      listContainer.appendChild(row);
    });

    adminArea.appendChild(listContainer);

  } catch (err) {
    adminArea.innerHTML = `<p style="color: red;">Ошибка загрузки списка: ${err.message}</p>`;
  }
}


async function loadAlbum() {
  const albumSection = document.getElementById('albumSection');
  if (!albumSection) return;

  try {
    const data = await getAlbums();
    const photos = data.photos || [];

    if (photos.length === 0) {
      albumSection.innerHTML = '<div class="album-empty">Вы ещё не добавили фото в альбом</div>';
      return;
    }

    albumSection.innerHTML = '<h2>Мой альбом: Лайкнутые фото</h2>';
    const gallery = document.createElement('div');
    gallery.className = 'gallery-grid';

    photos.forEach(photo => {
      gallery.appendChild(createCard(photo));
    });

    albumSection.appendChild(gallery);
  } catch (err) {
    albumSection.innerHTML = `<p style="color: red;">Ошибка загрузки альбома: ${err.message}</p>`;
  }
}



loadProfile();
loadAlbum();