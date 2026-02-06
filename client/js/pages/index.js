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
    renderComments(comments);
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

function renderComments(comments) {
  commentsList.innerHTML = comments.map(c => `
    <div class="comment">
      <div class="avatar">${c.user?.avatar ? `<img src="${c.user.avatar}" alt="">` : '👤'}</div>
      <div class="body">
        <div class="meta">${c.user?.username || 'Аноним'} · <span class="time">${new Date(c.createdAt).toLocaleString()}</span></div>
        <div>${escapeHTML(c.text)}</div>
      </div>
    </div>
  `).join('');
}

likeBtn.addEventListener('click', async () => {
  if (!currentPhotoId) return;
  try {
    await likePhoto(currentPhotoId);
    await loadPhotos();
    if (currentPhoto) {
      const updated = allPhotos.find(x => x._id === currentPhotoId || x.id === currentPhotoId);
      likeCount.textContent = (updated?.likes || []).length;
    }
  } catch (err) {
    alert('Ошибка: ' + err.message);
  }
});

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

commentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const txt = commentInput.value.trim();
  if (!txt || !currentPhotoId) return;

  try {
    await addComment(currentPhotoId, txt);
    const comments = await getComments(currentPhotoId);
    renderComments(comments);
    commentInput.value = '';
  } catch (err) {
    alert('Ошибка: ' + err.message);
  }
});

search.addEventListener('input', () => refresh(search.value));

window.addEventListener('openPhoto', (e) => openModal(e.detail._id || e.detail.id));

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

loadPhotos();