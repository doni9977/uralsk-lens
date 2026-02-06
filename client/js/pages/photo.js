import { renderNavbar } from '../components/navbar.js';
import { getAuthToken, uploadPhoto } from '../api/request.js';

renderNavbar(document.body);

const token = getAuthToken();
if (!token) {
  window.location.href = '/client/login.html';
}

const form = document.getElementById('uploadForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const fileInput = form.querySelector('input[type="file"]');
    const titleInput = form.querySelector('input[name="title"]');
    const descInput = form.querySelector('textarea[name="description"]');
    const categoryInput = form.querySelector('input[name="category"]');

    if (!fileInput.files[0]) {
      alert('Выберите файл');
      return;
    }

    formData.append('image', fileInput.files[0]);
    formData.append('title', titleInput.value || 'Без названия');
    formData.append('description', descInput.value || '');
    formData.append('category', categoryInput.value || 'Other');

    try {
      const result = await uploadPhoto(formData);
      alert('Фото загружено успешно!');
      window.location.href = '/client/profile.html';
    } catch (err) {
      alert('Ошибка загрузки: ' + err.message);
    }
  });
}
