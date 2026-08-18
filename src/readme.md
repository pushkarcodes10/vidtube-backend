# VidTube Backend API

A production-ready, scalable video streaming and content-sharing backend service inspired by YouTube. Built with modern JavaScript (ES Modules), Node.js, Express, and MongoDB, this platform provides end-to-end features including JWT authentication, Cloudinary media processing, video publishing and streaming workflows, custom playlist management, channel subscriptions, commenting, tweet updates, and channel analytics.

---

## Tech Stack

- **Runtime Environment:** Node.js (ES Modules)
- **Web Framework:** Express.js (Express 5.x)
- **Database & Object Data Modeling:** MongoDB with Mongoose ODM
- **Media Cloud Storage:** Cloudinary SDK (for avatars, cover images, thumbnails, and video assets)
- **Authentication & Security:** JSON Web Tokens (JWT) & bcrypt for password hashing
- **File Transfer Handling:** Multer (multipart form-data handling with disk storage staging)
- **Logging & Monitoring:** Winston logger & Morgan HTTP request profiler
- **Development & Code Quality:** Nodemon & Prettier

---

## Key Features

- **User Authentication & Authorization:** Secure registration, login, logout, password rotation, profile updates, and HTTP-only JWT access/refresh token rotation.
- **Media Management Pipeline:** Local temporary file staging using Multer and automatic upload handling to Cloudinary for media assets.
- **Video Publishing System:** Uploading video files and thumbnails, updating metadata, toggling publish status, incrementing view metrics, searching, sorting, and pagination.
- **Playlists:** Creating custom video collections, updating playlist details, appending/removing videos, and calculating total views and video count metrics.
- **Engagement & Likes System:** Toggle like state across videos, comments, and tweets, plus fetching user-liked videos.
- **Comments Infrastructure:** Video commenting system with paginated responses and reply count aggregations.
- **Subscription Management:** Toggle channel subscriptions, fetch subscribers list for a channel, and list all channels subscribed to by a user.
- **Tweets (Short Posts):** Create, update, delete, and view user status updates with integrated like capabilities.
- **Channel Dashboard & Analytics:** Aggregate channel statistics including total video views, subscriber count, total likes, and total published videos.
- **Centralized Error Handling & Logging:** Production-ready request logger with Winston/Morgan and standardized API error/response handling wrappers.

---

## Project Structure

```text
vidtube/
├── public/                 # Static assets and temporary Multer uploads
│   └── temp/
├── src/
│   ├── controllers/        # Request handlers & business logic
│   │   ├── comment.controllers.js
│   │   ├── dashboard.controllers.js
│   │   ├── healthcheck.controllers.js
│   │   ├── like.controllers.js
│   │   ├── playlist.controllers.js
│   │   ├── subscription.controllers.js
│   │   ├── tweet.controllers.js
│   │   ├── user.controllers.js
│   │   └── video.controllers.js
│   ├── db/                 # MongoDB connection configuration
│   │   └── index.js
│   ├── middlewares/        # Express middleware functions
│   │   ├── auth.middlewares.js
│   │   ├── error.middlewares.js
│   │   └── multer.middlewares.js
│   ├── models/             # Mongoose database models
│   │   ├── comment.models.js
│   │   ├── like.models.js
│   │   ├── playlist.models.js
│   │   ├── subsription.models.js
│   │   ├── tweet.models.js
│   │   ├── user.models.js
│   │   └── video.models.js
│   ├── routes/             # Express routes definition
│   │   ├── healthcheck.routes.js
│   │   └── user.routes.js
│   ├── utils/              # Helper utilities
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   └── cloudinary.js
│   ├── app.js              # Express app setup and middleware configuration
│   ├── index.js            # Application entry point
│   ├── logger.js           # Winston logger setup
│   ├── constants.js        # Global constants
│   └── readme.md           # Documentation
├── .env.sample             # Environment configuration template
├── .prettierrc             # Prettier code format configuration
├── package.json            # Node.js dependencies and scripts
└── app.log                 # Generated application log file
```

---

## Database Schema Design

- **User:** Stores username, email, full name, avatar URL, cover image URL, watch history, password hash, and active refresh token.
- **Video:** Stores video URL, thumbnail URL, title, description, duration, views count, publish status (`isPublished`), and channel owner reference.
- **Subscription:** Maps subscriber user to target channel user.
- **Like:** Generic model mapping a user reference (`likedBy`) to a `video`, `comment`, or `tweet`.
- **Comment:** Stores comment text associated with a specific `video` and `owner`.
- **Playlist:** Aggregates a list of `Video` references under a name and description, linked to an `owner`.
- **Tweet:** Contains text updates posted by an `owner`.

---

## Environment Variables

Create a `.env` file in the project root based on the following template:

```env
PORT=8000
CORS_ORIGIN=*
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## API Documentation

### Healthcheck
- `GET /api/v1/healthcheck` - Returns server running status and timestamp.

### Authentication & User Management
- `POST /api/v1/users/register` - Register new user (multipart form data with `avatar` and optional `coverImage`).
- `POST /api/v1/users/login` - Authenticate user credentials and return HTTP-only auth cookies.
- `POST /api/v1/users/logout` - Invalidate refresh token and clear auth cookies (Secured).
- `POST /api/v1/users/refresh-token` - Renew access token using refresh token.
- `POST /api/v1/users/change-password` - Update current user password (Secured).
- `GET /api/v1/users/current-user` - Get current authenticated user details (Secured).
- `PATCH /api/v1/users/update-account` - Update account full name and email (Secured).
- `PATCH /api/v1/users/avatar` - Update avatar image file (Secured).
- `PATCH /api/v1/users/cover-image` - Update cover image file (Secured).
- `GET /api/v1/users/c/:username` - Fetch channel profile details with subscriber counts (Secured).
- `GET /api/v1/users/history` - Retrieve watch history with video owner information (Secured).

### Video Management
- `GET /api/v1/videos` - Search, sort, and paginate videos.
- `POST /api/v1/videos` - Publish a video with video file and thumbnail uploads (Secured).
- `GET /api/v1/videos/:videoId` - Fetch video details, channel stats, and increment views (Secured).
- `PATCH /api/v1/videos/:videoId` - Update video title, description, or thumbnail (Secured).
- `DELETE /api/v1/videos/:videoId` - Delete video and clean up related comments/likes (Secured).
- `PATCH /api/v1/videos/toggle/publish/:videoId` - Toggle video public visibility (Secured).

### Playlist Management
- `POST /api/v1/playlists` - Create a new playlist (Secured).
- `GET /api/v1/playlists/user/:userId` - Get all playlists created by a specific user (Secured).
- `GET /api/v1/playlists/:playlistId` - Get playlist details with populated video items and view metrics (Secured).
- `PATCH /api/v1/playlists/add/:videoId/:playlistId` - Add video to playlist (Secured).
- `PATCH /api/v1/playlists/remove/:videoId/:playlistId` - Remove video from playlist (Secured).
- `PATCH /api/v1/playlists/:playlistId` - Update playlist title and description (Secured).
- `DELETE /api/v1/playlists/:playlistId` - Delete playlist (Secured).

### Like System
- `POST /api/v1/likes/toggle/v/:videoId` - Toggle like on a video (Secured).
- `POST /api/v1/likes/toggle/c/:commentId` - Toggle like on a comment (Secured).
- `POST /api/v1/likes/toggle/t/:tweetId` - Toggle like on a tweet (Secured).
- `GET /api/v1/likes/videos` - Get all videos liked by the current user (Secured).

### Subscriptions
- `POST /api/v1/subscriptions/c/:channelId` - Toggle channel subscription (Secured).
- `GET /api/v1/subscriptions/c/:channelId` - Get list of subscribers for a channel (Secured).
- `GET /api/v1/subscriptions/u/:subscriberId` - Get list of channels subscribed by a user (Secured).

### Tweets
- `POST /api/v1/tweets` - Create a tweet post (Secured).
- `GET /api/v1/tweets/user/:userId` - Fetch user tweets with likes count (Secured).
- `PATCH /api/v1/tweets/:tweetId` - Update tweet content (Secured).
- `DELETE /api/v1/tweets/:tweetId` - Delete tweet (Secured).

---

## Installation & Setup

1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd vidtube
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables:**
   - Copy `.env.sample` to `.env` and fill in your MongoDB URI, JWT secrets, and Cloudinary credentials.

4. **Run in Development Mode:**
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:8000` (or your configured `PORT`).*

5. **Code Formatting:**
   ```bash
   npm run format
   ```

---

## Logging System

The backend features a structured logging setup using **Winston** and **Morgan**:
- Console output with color-coded log levels for local debugging.
- Persistent file logging saved to `app.log` recording request HTTP method, path, status code, response time, and timestamps.
