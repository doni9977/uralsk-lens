import { renderNavbar } from '../components/navbar.js';

renderNavbar(document.body);

const URALSK_COORDS = [51.2333, 51.3667];

function initMap() {
  if (typeof L === 'undefined') {
    console.error('Leaflet не загружен! Проверь подключение скрипта в HTML.');
    return;
  }

  const map = L.map('map').setView(URALSK_COORDS, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  L.marker(URALSK_COORDS).addTo(map)
    .bindPopup('<b>Уральск</b><br>Это центр города')
    .openPopup();

}
initMap();