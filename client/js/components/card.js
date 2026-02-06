export function createCard(photo){
  const el = document.createElement('div');
  el.className = 'card';
  el.dataset.id = photo._id || photo.id;
  el.innerHTML = `
    <img src="${photo.imageUrl}" alt="${photo.title}" />
    <div class="meta"><div class="title">${photo.title}</div><div class="likes">❤ ${photo.likes?.length || 0}</div></div>`;
  el.addEventListener('click', ()=> window.dispatchEvent(new CustomEvent('openPhoto', { detail: photo })));
  return el;
}
