import { API_BASE } from './config.js';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function getAuthToken() {
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

function getAuthHeader() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function request(endpoint, options = {}) {
  const method = options.method || 'GET';
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const config = {
    method,
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, config);
  
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(response.status, data.message || 'Request failed');
  }

  return data;
}

// Auth
export async function register(username, email, password) {
  return request('/auth/register', {
    method: 'POST',
    body: { username, email, password },
  });
}

export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  if (data.token) {
    setAuthToken(data.token);
  }
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}

export function logout() {
  setAuthToken(null);
}

export async function getProfile() {
  return request('/users/profile');
}

export async function updateProfile(updates) {
  return request('/users/profile', {
    method: 'PUT',
    body: updates,
  });
}

// Получить всех пользователей (для админа)
export async function getAllUsers() {
  return request('/users', { method: 'GET' });
}

// Назначить фотографом
export async function setPhotographer(userId) {
  return request(`/users/${userId}/set-photographer`, { method: 'PUT' });
}

// Photos
export async function getPhotos(query = {}) {
  const params = new URLSearchParams();
  if (query.category) params.append('category', query.category);
  if (query.q) params.append('q', query.q);
  
  const queryString = params.toString();
  const endpoint = queryString ? `/photos?${queryString}` : '/photos';
  return request(endpoint);
}

export async function getPhoto(id) {
  return request(`/photos/${id}`);
}

export async function uploadPhoto(formData) {
  const token = getAuthToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${API_BASE}/photos`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(response.status, data.message || 'Upload failed');
  }
  return data;
}

export async function likePhoto(photoId) {
  return request(`/photos/${photoId}/like`, {
    method: 'PUT',
  });
}

export async function getCategories() {
  return request('/photos/categories');
}

// Comments
export async function getComments(photoId) {
  return request(`/photos/${photoId}/comments`);
}

export async function addComment(photoId, text) {
  return request(`/photos/${photoId}/comments`, {
    method: 'POST',
    body: { text },
  });
}

export async function deleteComment(commentId) {
  return request(`/comments/${commentId}`, {
    method: 'DELETE',
  });
}

// Albums
export async function getAlbums() {
  return request('/albums');
}

export async function createAlbum(title, description) {
  return request('/albums', {
    method: 'POST',
    body: { title, description },
  });
}

export async function addPhotoToAlbum(albumId, photoId) {
  return request(`/albums/${albumId}/add`, {
    method: 'POST',
    body: { photoId },
  });
}

// Map
export async function getPhotosMap() {
  return request('/photos/map');
}
