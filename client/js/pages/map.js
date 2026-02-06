import { renderNavbar } from '../components/navbar.js';

renderNavbar(document.body);

const mapContainer = document.getElementById('map');

function initMap() {
  mapContainer.innerHTML = `
    <div class="map-placeholder">
      <p>Карта Уральска скоро будет здесь.</p>
      <p>Мы добавим отображение карты без точек фото.</p>
    </div>
  `;
}

initMap();
