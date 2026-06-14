# VidTube Backend 🎥

A robust, production-ready video streaming and content-sharing backend API inspired by YouTube. Built with modern JavaScript technologies, this platform features secure authentication, media uploads, commenting systems, playlists, tweets, channel metrics dashboards, and subscriber management.

---

## 🚀 Tech Stack

- **Runtime Environment:** [Node.js](https://nodejs.org/) (ES Modules)
- **Web Framework:** [Express.js](https://expressjs.com/) (Express 5.x)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM
- **Media Storage:** [Cloudinary](https://cloudinary.com/) (via integration for avatar, cover, and video uploads)
- **Authentication:** JSON Web Tokens ([JWT](https://jwt.io/)) & [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- **File Upload Middleware:** [Multer](https://github.com/expressjs/multer)
- **Logging & Monitoring:** [Winston](https://github.com/winstonjs/winston) & [Morgan](https://github.com/expressjs/morgan)
- **Code Quality:** [Prettier](https://prettier.io/) & [Nodemon](https://nodemon.io/)

---

## 🛠️ Key Features

- **User Authentication & Authorization:** Secure registration, login, logout, password updates, profile management, and JWT-based access/refresh token rotation.
- **Media Management:** Local temporary file staging using Multer and seamless uploading to Cloudinary for avatars, cover images, and videos.
- **Videos Module:** Uploading, publishing, updating, soft-deleting/toggling visibility, and tracking video metrics (views, duration).
- **Playlists:** Creating custom video collections, updating playlist details, and adding/removing videos.
- **Comments & Likes System:** Submitting comments on videos, liking/unliking videos, comments, and tweets.
- **Subscriptions:** Subscribing to/unsubscribing from channels, listing channel subscribers, and listing subscribed channels.
- **Tweets (Shorts/Posts):** Creating, updating, deleting, and fetching user posts or updates.
- **Dashboard:** Rich channel analytics aggregating total views, likes, videos, and subscriber counts.
- **Structured Error Handling & Logging:** Production-ready request logging with Winston/Morgan and a generic API Error class middleware.

---

## 📂 Project Structure

```text
vidtube/
├── public/                 # Static assets and temporary Multer uploads
├── src/
│   ├── controllers/        # Request handlers & core business logic
│   │   ├── comment.controllers.js
│   │   ├── dashboard.controllers.js
│   │   ├── healthcheck.controllers.js
│   │   ├── like.controllers.js
│   │   ├── playlist.controllers.js
│   │   ├── subscription.controllers.js
│   │   ├── tweet.controllers.js
│   │   ├── user.controllers.js
│   │   └── video.controllers.js
│   ├── db/                 # Database connection logic
│   │   └── index.js
│   ├── middlewares/        # Custom Express middlewares
│   │   ├── auth.middlewares.js
│   │   ├── error.middlewares.js
│   │   └── multer.middlewares.js
│   ├── models/             # Mongoose database schemas
│   │   ├── comment.models.js
│   │   ├── like.models.js
│   │   ├── playlist.models.js
│   │   ├── subsription.models.js
│   │   ├── tweet.models.js
│   │   ├── user.models.js
│   │   └── video.models.js
│   ├── routes/             # Express routing
│   │   ├── healthcheck.routes.js
│   │   └── user.routes.js
│   ├── app.js              # Express app setup and global middlewares
│   ├── index.js            # Server entry point
│   ├── logger.js           # Winston logger configuration
│   ├── constants.js        # Global constants (e.g. DB name)
│   └── readme.md           # Documentation (this file)
├── .env                    # Local environment secrets (ignored by Git)
├── .prettierrc             # Code formatting configuration
├── package.json            # Node.js dependencies and run scripts
└── app.log                 # Generated application logs (ignored by Git)
```

---

## 🔐 Database Models

The schema relations are modeled as follows:
- **User:** Stores username, email, full name, avatar, cover image, watch history (references to Video), password, and refresh token.
- **Video:** Stores video file URL, thumbnail, title, description, duration, views, publishing status, and owner reference.
- **Subscription:** Maps a subscriber (User) to a channel (User).
- **Like:** Links a user's like to a specific Video, Comment, or Tweet.
- **Comment:** Contains comment text linked to a specific Video and owner (User).
- **Playlist:** Aggregates a list of Videos under a title and description, owned by a User.
- **Tweet:** Contains short text updates posted by a User.

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
PORT=8000
CORS_ORIGIN=*
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net

# JWT Tokens
ACCESS_TOKEN_SECRET=your_jwt_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_jwt_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 📡 API Endpoints

### 🩺 Healthcheck
- `GET /api/v1/healthcheck` - Server status and database health indicator.

### 👤 User Authentication & Management
- `POST /api/v1/users/register` - Create a new user (expects avatar and cover image files via Multer).
- `POST /api/v1/users/login` - Authenticate user credentials and return HTTP-only cookies with JWT tokens.
- `POST /api/v1/users/logout` - Clear JWT authentication cookies (Secured).
- `POST /api/v1/users/refresh-token` - Regenerate access and refresh tokens.
- `POST /api/v1/users/change-password` - Change the authenticated user's password (Secured).
- `GET /api/v1/users/current-user` - Retrieve details of the logged-in user (Secured).
- `PATCH /api/v1/users/update-account` - Update account details (email, full name) (Secured).
- `PATCH /api/v1/users/avatar` - Upload a new avatar image (Secured).
- `PATCH /api/v1/users/cover-image` - Upload a new cover image (Secured).
- `GET /api/v1/users/c/:username` - View another user's channel profile (Secured).
- `GET /api/v1/users/history` - Retrieve the user's watch history (Secured).

*(Additional endpoints for Videos, Playlists, Tweets, Likes, Comments, and Subscriptions will be configured in their respective routers).*

---

## 🔧 Installation & Setup

1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd vidtube
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Follow the instructions in the [Environment Variables](#%EF%B8%8F-environment-variables) section.

4. **Run in Development Mode:**
   ```bash
   npm run dev
   ```
   *The server runs on `http://localhost:8000` (or specified `PORT`).*

5. **Code Formatting:**
   ```bash
   npm run format
   ```
   *Ensure standard formatting styles using Prettier.*

---

## 📝 Logging System

The application utilizes a custom **Winston logger** integrated with **Morgan** for HTTP request profiling.
- Terminal outputs are colorized for readability.
- Detailed JSON logs are persisted in `app.log` in the root folder, including method type, requested URL, response status code, and latency in milliseconds.
