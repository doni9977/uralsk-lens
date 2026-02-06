# Uralsk Lens — Полное руководство

Это репозиторий фронтенда и REST API для портфолио города Уральск: загрузка фотографий, альбомы, комментарии, лайки и поисковые/карточные эндпоинты.

---

## 1) Подготовка окружения

1. Скопируйте `.env.example` в `.env` и заполните переменные:
   - `MONGO_URI` — ссылка на MongoDB Atlas (пример):
     ```text
     mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/uralsk?retryWrites=true&w=majority
     ```
   - `JWT_SECRET` — любая длинная случайная строка
   - `PORT` — порт сервера (по умолчанию 5000). Пример: `PORT=8080` если хотите запускать на 8080.
2. Установите зависимости:
   ```bash
   npm install
   ```
3. Запустите в режиме разработки (с перезапуском при изменениях):
   ```bash
   npm run dev
   ```
   - При запуске сервер подключится к MongoDB если `MONGO_URI` валиден; если нет — сервер всё равно запустится, но операции с базой будут недоступны.

---

## 2) Быстрая проверка
- Health: GET http://localhost:<PORT>/health  (например http://localhost:5000/health)
- Фронтенд: откройте http://localhost:<PORT>/
- Загруженные файлы доступны по URL: http://localhost:<PORT>/uploads/<filename>

---

## 3) Настройка Postman (рекомендуется)
1. Создайте окружение и переменные:
   - `baseUrl` = `http://localhost:<PORT>`
   - `token` = (останется пустым до логина)
2. После успешного логина вставьте в `token` значение токена (без `Bearer `), либо используйте Authorization → Bearer Token в Postman.

---

## 4) Примеры запросов (Postman / подробности)

1) Регистрация (Register)
- Method: POST
- URL: `{{baseUrl}}/api/auth/register`
- Body → raw → JSON:
  {
    "username": "ivan",
    "email": "ivan@example.com",
    "password": "password123",
    "role": "photographer"   // опционально: admin | photographer | viewer
  }
- Успех: HTTP 201, сообщение о регистрации.

2) Вход (Login)
- Method: POST
- URL: `{{baseUrl}}/api/auth/login`
- Body → raw → JSON:
  {
    "email": "ivan@example.com",
    "password": "password123"
  }
- Успех: HTTP 200, JSON: `{ "token": "<JWT_TOKEN>" }` — сохраните `token`.

3) Профиль пользователя (получение данных)
- Method: GET
- URL: `{{baseUrl}}/api/users/profile`
- Header: `Authorization: Bearer {{token}}`
- Успех: HTTP 200, объект пользователя (без пароля).

4) Загрузка фотографии (Upload photo)
- Method: POST
- URL: `{{baseUrl}}/api/photos`
- Authorization: Bearer {{token}}
- Body → form-data (multipart):
  - Key: `image` (type = File) — файл изображения
  - Key: `title` (Text) — обязательное
  - Key: `description` (Text) — опционально
  - Key: `category` (Text) — опционально (e.g., Architecture, Nature)
- Успех: HTTP 201, возвращается объект Photo с полем `imageUrl` (пример `/uploads/1645123-...jpg`).
    - Примечание: координаты `lat/lng` сейчас не используются на фронтенде.

5) Получить список фото
- Method: GET
- URL: `{{baseUrl}}/api/photos`
- Опции query: `?category=Architecture` или `?q=поисковый_запрос`

6) Поставить/убрать лайк
- Method: PUT
- URL: `{{baseUrl}}/api/photos/:id/like`
- Header: `Authorization: Bearer {{token}}`
- Успех: HTTP 200, возвращается объект Photo с обновлёнными likes.

7) Комментарии
- GET `{{baseUrl}}/api/photos/:id/comments` — получить список комментариев
- POST `{{baseUrl}}/api/photos/:id/comments` — protected, Body JSON: `{ "text": "Отличное фото" }`
- DELETE `{{baseUrl}}/api/comments/:id` — protected (владелец или admin)

8) Альбомы
- POST `{{baseUrl}}/api/albums` — protected, Body JSON: `{ "title": "Мой альбом", "description": "Описание" }`
- GET `{{baseUrl}}/api/albums` — список альбомов
- POST `{{baseUrl}}/api/albums/:id/add` — protected, Body JSON: `{ "photoId": "<photoId>" }`

9) Карта (опционально) и категории
- GET `{{baseUrl}}/api/photos/map` — фото с геоданными (если координаты есть)
- GET `{{baseUrl}}/api/categories` — список уникальных категорий

---

## 5) Примеры cURL
Регистрация:
```bash
curl -s -X POST {{baseUrl}}/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ivan","email":"ivan@example.com","password":"password123"}'
```

Логин:
```bash
curl -s -X POST {{baseUrl}}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ivan@example.com","password":"password123"}'
```

Загрузка файла (multipart):
```bash
curl -X POST {{baseUrl}}/api/photos \
  -H "Authorization: Bearer <TOKEN>" \
  -F "image=@/path/to/photo.jpg" \
  -F "title=Набережная" \
  -F "description=Красивое место"
```

---

## 6) Отладка и примечания
- Если вы запустили без корректного `MONGO_URI`, в логах увидите ошибку подключения — сервер всё равно запустится, но CRUD будет недоступен.
- Переменная `PORT` контролирует порт сервера. Чтобы временно запустить на 8080: `PORT=8080 npm run dev`.
- Файлы загруженные в `uploads/` не должны попадать в репозиторий — `.gitignore` содержит `uploads/`.

---

## 7) Валидация и обработка ошибок

### Валидация входящих данных
Используется `express-validator` в роутерах:
- Auth (email, password): [app/routes/auth.routes.js](app/routes/auth.routes.js)
- Фото (id, title): [app/routes/photo.routes.js](app/routes/photo.routes.js)
- Альбомы (title, id, photoId): [app/routes/album.routes.js](app/routes/album.routes.js)
- Комментарии (id, text): [app/routes/comment.routes.js](app/routes/comment.routes.js)

### Обработка ошибок
- 400 — ошибки валидации (возвращается список ошибок).
- 401 — нет токена/невалидный токен.
- 403 — нет прав доступа.
- 404 — ресурс не найден.
- 500 — внутренняя ошибка сервера.

Глобальный обработчик ошибок и 404 находятся в [server.js](server.js).
