export function createCard(photo) {
  const el = document.createElement('div');
  el.className = 'card';
  el.dataset.id = photo._id || photo.id;

  el.innerHTML = `
    <img src="${photo.imageUrl}" alt="${photo.title}" />
    <div class="meta">
      <div class="title">${photo.title}</div>
      <div class="likes">❤ ${photo.likes?.length || 0}</div>
    </div>
  `;

  let user = null;
  const token = localStorage.getItem('auth_token');

  try {
    const userStr = localStorage.getItem('user');
    if (userStr) user = JSON.parse(userStr);
  } catch (e) {
    console.error("Ошибка чтения юзера:", e);
  }

  const myId = user ? String(user.id) : null;
  const ownerRaw = photo.owner?._id || photo.owner || photo.user?._id || photo.user;
  const ownerId = ownerRaw ? String(ownerRaw) : null;

  const isAdmin = user && user.role === 'admin';
  const isOwner = myId && ownerId && (myId === ownerId);
  const canDelete = token && (isAdmin || isOwner);

  console.log(`ФОТО: ${photo.title}`, {
    Я_Админ: isAdmin,
    Я_Владелец: isOwner,
    Мой_ID: myId,
    ID_Владельца: ownerId,
    ИТОГ_КНОПКА_БУДЕТ: canDelete
  });

  if (canDelete) {
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить 🗑';
    
    deleteBtn.style.cssText = `
        background: red; 
        color: white; 
        border: none; 
        padding: 5px 10px; 
        margin-top: 10px; 
        cursor: pointer; 
        font-weight: bold;
        z-index: 100;
        position: relative;
    `;

    deleteBtn.onclick = async (e) => {
      e.stopPropagation(); 
      if (!confirm('Точно удалить?')) return;
      
      try {
        const res = await fetch(`http://localhost:8080/api/photos/${photo._id || photo.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          alert('Удалено!');
          window.location.reload();
        } else {
          alert('Ошибка сервера');
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    el.appendChild(deleteBtn);
  }

  el.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('openPhoto', { detail: photo }));
  });

  return el;
}