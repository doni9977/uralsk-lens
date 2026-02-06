export function escapeHTML(str){ return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }
export function formatDate(ts){ return new Date(ts).toLocaleString(); }
