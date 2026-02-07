import { renderNavbar } from '../components/navbar.js';
import { createCard } from '../components/card.js';
import { getPhotos, likePhoto, getComments, addComment, deleteComment, getAuthToken } from '../api/request.js';

renderNavbar(document.body);

const gallery = document.getElementById('galleryGrid');
const search = document.getElementById('searchInput');

let allPhotos = [];

async function loadPhotos() {
  try {
    allPhotos = await getPhotos();
    refresh(search.value);
  } catch (err) {
    console.error('Ошибка загрузки фото:', err);
    gallery.innerHTML = '<p>Ошибка загрузки фотографий</p>';
  }
}

function render(list) {
  gallery.innerHTML = '';
  list.forEach(p => gallery.appendChild(createCard(p)));
}

function refresh(q = '') {
  const query = q.trim().toLowerCase();
  const items = allPhotos.filter(p =>
    !query || 
    p.title.toLowerCase().includes(query) || 
    (p.description && p.description.toLowerCase().includes(query))
  );
  render(items);
}

// modal elements
const modal = document.getElementById('photoModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const likeBtn = document.getElementById('likeBtn');
const likeCount = document.getElementById('likeCount');
const commentsList = document.getElementById('modalComments');
const commentForm = document.getElementById('commentForm');
const commentInput = document.getElementById('commentInput');
const modalClose = document.getElementById('modalClose');
let currentPhotoId = null;
let currentPhoto = null;

// --- RBAC ---
let user = null;
try {
  const userStr = localStorage.getItem('user');
  if (userStr) user = JSON.parse(userStr);
} catch (e) {}
const token = localStorage.getItem('auth_token');

// --- Кнопка удаления фото в модальном окне (БЕЗ ПАНЕЛИ УПРАВЛЕНИЯ) ---
function renderDeletePhotoButton(photo) {
  const modalRight = document.getElementById('photoModal')?.querySelector('.right');
  if (!modalRight) return;

  // Удаляем старую кнопку перед отрисовкой новой
  const oldBtn = modalRight.querySelector('.btn-danger');
  if (oldBtn) oldBtn.remove();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const myId = String(user.id);
  // Проверяем владельца (owner или user._id в зависимости от ответа сервера)
  const ownerId = String(photo.user?._id || photo.user || photo.owner);
  
  const isAdmin = user.role === 'admin';
  const isOwner = myId === ownerId;

  // Если админ или владелец — рисуем кнопку удаления сразу
  if (isAdmin || isOwner) {
    const btn = document.createElement('button');
    btn.textContent = 'Удалить фото';
    btn.className = 'btn btn-danger';
    btn.style.cssText = 'margin:10px 0; background: #d32f2f; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; width: 100%;';
    
    btn.onclick = async () => {
      if (!confirm('Вы уверены, что хотите удалить это фото?')) return;
      
      const url = isAdmin ? `http://localhost:8080/api/photos/${photo._id || photo.id}/admin-delete` : `http://localhost:8080/api/photos/${photo._id || photo.id}`;
      
      const resp = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
      });

      if (resp.ok) {
        alert('Фото удалено');
        closeModal();
        location.reload();
      } else {
        alert('Ошибка при удалении');
      }
    };
    modalRight.appendChild(btn);
  }
}

async function openModal(id) {
  currentPhotoId = id;
  currentPhoto = allPhotos.find(x => x._id === id || x.id === id);
  
  if (!currentPhoto) return;

  modalImage.src = currentPhoto.imageUrl;
  modalTitle.textContent = currentPhoto.title;
  likeCount.textContent = (currentPhoto.likes || []).length;
  likeBtn.dataset.photoId = id;
  
  const token = getAuthToken();
  if (token) {
    likeBtn.style.display = 'block';
    commentForm.style.display = 'block';
  } else {
    likeBtn.style.display = 'none';
    commentForm.style.display = 'none';
  }

  try {
    const comments = await getComments(id);
    renderComments(comments, currentPhoto);
    // Теперь вызываем только прямую кнопку удаления
    renderDeletePhotoButton(currentPhoto);
  } catch (err) {
    console.error('Ошибка загрузки комментариев:', err);
  }

  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
  currentPhotoId = null;
  currentPhoto = null;
}

// --- Рендеринг комментариев с прямым удалением ---
function renderComments(comments, photo) {
  const commentsList = document.getElementById('modalComments');
  commentsList.innerHTML = '';
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  comments.forEach(c => {
    const div = document.createElement('div');
    div.className = 'comment';
    div.innerHTML = `
      <div class="avatar">${c.user?.avatar ? `<img src="${c.user.avatar}" alt="">` : '👤'}</div>
      <div class="body">
        <div class="meta">
          ${c.user?.username || 'Аноним'} · 
          <span class="time">${new Date(c.createdAt).toLocaleString()}</span>
        </div>
        <div>${escapeHTML(c.text)}</div>
      </div>`;

    // Кнопка удаления только для admin или автора комментария
    if (user.role === 'admin' || String(user.id) === String(c.user?._id || c.user || c.author)) {
      const del = document.createElement('button');
      del.textContent = '×';
      del.style.cssText = 'margin-left:8px; color:red; background:none; border:none; font-size:18px; cursor:pointer; font-weight:bold;';
      
      del.onclick = async () => {
        if (!confirm('Удалить этот комментарий?')) return;
        try {
          await fetch(`http://localhost:8080/api/comments/${c._id || c.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
          });
          div.remove();
        } catch (err) { alert('Ошибка удаления'); }
      };
      div.querySelector('.body').appendChild(del);
    }
    commentsList.appendChild(div);
  });
}

// --- Админ-панель: СПИСОК ВСЕХ ПОЛЬЗОВАТЕЛЕЙ с кнопкой "Set Photographer" ---
async function renderSetPhotographerUI() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role !== 'admin') return;

  let users = [];
  try {
    const res = await fetch('http://localhost:8080/api/users', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
    });
    users = await res.json();
  } catch (e) { console.error("Ошибка загрузки юзеров"); }

  const container = document.getElementById('profileContent');
  if (!container) return;

  // Создаем область для списка
  const listArea = document.createElement('div');
  listArea.className = 'admin-user-list-section';
  listArea.innerHTML = '<hr><h2>Список всех пользователей</h2>';

  users.forEach(u => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; align-items:center; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;';
    row.innerHTML = `<span>${u.username} (<b>${u.role}</b>)</span>`;

    // Кнопка повышения, если он еще не фотограф
    if (u.role === 'viewer') {
      const btn = document.createElement('button');
      btn.textContent = 'Set Photographer';
      btn.style.cssText = 'background:#1976d2; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;';
      
      btn.onclick = async () => {
        if (!confirm(`Сделать ${u.username} фотографом?`)) return;
        // Используем твой URL
        const resp = await fetch(`http://localhost:8080/api/users/${u._id}/set-photographer`, {
          method: 'PUT', // Если бэкенд ждет PUT, оставляем PUT
          headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
        });

        if (resp.ok) {
          alert('Роль успешно обновлена!');
          row.querySelector('b').textContent = 'photographer';
          btn.remove();
        } else {
          alert('Ошибка при обновлении роли');
        }
      };
      row.appendChild(btn);
    }
    listArea.appendChild(row);
  });

  container.appendChild(listArea);
}

// --- Остальные события (Like, Search, Close) ---
likeBtn.addEventListener('click', async () => {
  if (!currentPhotoId) return;
  try {
    await likePhoto(currentPhotoId);
    await loadPhotos();
    const updated = allPhotos.find(x => x._id === currentPhotoId || x.id === currentPhotoId);
    if (updated) likeCount.textContent = (updated.likes || []).length;
  } catch (err) { alert('Ошибка: ' + err.message); }
});

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

commentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const txt = commentInput.value.trim();
  if (!txt || !currentPhotoId) return;
  try {
    await addComment(currentPhotoId, txt);
    const comments = await getComments(currentPhotoId);
    renderComments(comments, currentPhoto);
    commentInput.value = '';
  } catch (err) { alert('Ошибка: ' + err.message); }
});

search.addEventListener('input', () => refresh(search.value));

window.addEventListener('openPhoto', (e) => openModal(e.detail._id || e.detail.id));

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// Запуск
loadPhotos();
renderSetPhotographerUI();