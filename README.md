# Uralsk-Lens

A lightweight photo-sharing web app with albums, comments and basic auth.

## Project overview

Uralsk-Lens lets users register, upload photos, browse categories, like and comment on photos, and organize images into albums. The project includes a Node.js + Express backend and a static frontend under the `client` folder.

Tech stack
- Node.js, Express
- MongoDB (optional. app can start without it)
- Frontend: static HTML/JS in `client/`

## Quick start
1. Install dependencies

```bash
npm install
```

2. Create a `.env` file with at least:

```
MONGO_URI=mongodb://...   # optional; without it server still runs
JWT_SECRET=your_secret
PORT=5000
```

3. Start the server

```bash
node server.js
# or if package.json defines start: npm start
```

Open http://localhost:8080 to view the frontend index page.

## API documentation
All API routes are mounted at the root and mostly use JSON.

Auth
- POST /api/auth/register
  - Body: `{ username, email, password, role? }`
  - Response: `201` on success (`{ message: 'User registered' }`) or validation errors.
- POST /api/auth/login
  - Body: `{ email, password }`
  - Response: `{ token }` (JWT, expires in 7 days)
- GET /api/users/profile (protected)
  - Response: current user object (without password)
- PUT /api/users/profile (protected)
  - Body (optional fields): `{ username, email, bio, avatar }`
  - Response: `{ message: 'Profile updated', user }`

Photos
- GET /api/photos
  - Query: `?category=<name>&q=<text>` (text search)
  - Response: list of photos populated with `user` (username, avatar)
- GET /api/photos/categories
  - Response: array of distinct category names
- GET /api/photos/map
  - Response: photos that include `location` (lat/lng) — used by the map page
- GET /api/photos/:id
  - Response: single photo object
- POST /api/photos (protected)
  - Multipart `multipart/form-data` with `image` file and fields: `title`, `description`, `category`, `lat`, `lng`
  - Response: created photo object
- PUT /api/photos/:id (protected)
  - Body: `{ title?, description?, category? }` — only owner or admin may update
  - Response: updated photo
- DELETE /api/photos/:id (protected)
  - Only owner or admin may delete. Response: `{ message: 'Deleted' }`
- PUT /api/photos/:id/like (protected)
  - Toggles current user's like on the photo. Response: photo object with updated `likes`.

Albums
- POST /api/albums (protected)
  - Body: `{ title, description? }` — creates an album
- GET /api/albums
  - Response: list of albums (populated with photos)
- POST /api/albums/:id/add (protected)
  - Body: `{ photoId }` — adds photo to album

Comments
- GET /api/photos/:id/comments
  - Response: comments for the photo (populated with `user`)
- POST /api/photos/:id/comments (protected)
  - Body: `{ text }` — creates a comment
- DELETE /api/comments/:id (protected)
  - Only comment owner or admin may delete

Errors: Validation errors return `400` with `{ errors: [...] }`. Authentication/authorization errors return `401` or `403`.

Key backend files
- `server.js` — app entry and static client hosting
- [app/routes/auth.routes.js](app/routes/auth.routes.js) — auth/user routes
- [app/routes/photo.routes.js](app/routes/photo.routes.js) — photo endpoints
- [app/routes/album.routes.js](app/routes/album.routes.js) — album endpoints
- [app/routes/comment.routes.js](app/routes/comment.routes.js) — comment endpoints
- [app/controllers](app/controllers) — request handlers and business logic

## Frontend: pages and features
- Home / Gallery <img width="1919" height="711" alt="image" src="https://github.com/user-attachments/assets/c29bb85c-e496-4e3a-9ed9-0cd509c2c0d3" />
 — grid of photos, category filters, search.

- Photo page <img width="1919" height="844" alt="image" src="https://github.com/user-attachments/assets/f71d2806-bf38-41da-b93d-bece0f66a5c7" />
 — photo detail, comments, like button, map preview (if geotagged).

- Login / Register <img width="1919" height="748" alt="image" src="https://github.com/user-attachments/assets/2112238c-6152-4b5b-85e5-03fa47d70849" />
 — auth forms and client-side validation.

- Profile <img width="1896" height="972" alt="image" src="https://github.com/user-attachments/assets/e00b9f33-b71f-46dc-96bd-7a9222277112" />
 — view and edit profile.

- Map <img width="1898" height="977" alt="image" src="https://github.com/user-attachments/assets/02d5ed51-7b06-4fb8-9c87-6f1fbe1efe6a" />
 — shows geotagged photos on a map via `/api/photos/map`.

- Album pages <img width="1919" height="925" alt="image" src="https://github.com/user-attachments/assets/0eba8b23-9865-4a83-9a31-05eaca13fec1" />
 — create an album and add photos.

## File locations (quick reference)
- Backend routes: `app/routes/*.js`
- Backend controllers: `app/controllers/*.js`
- Models: `app/models/*.js`
- Frontend pages: `client/*.html`
- Frontend scripts: `client/js/pages/*`, `client/js/components/*`, `client/js/api/*`

## Environment variables
- `MONGO_URI` — MongoDB connection string (optional; server can run without it but DB features will be disabled)
- `JWT_SECRET` — secret for signing JWT tokens (default in code: `CHANGE_ME` — replace in production)
- `PORT` — port to run server
