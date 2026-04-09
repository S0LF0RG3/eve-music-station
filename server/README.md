# Eve Music Station - Suno Backend Service

This backend service provides Google OAuth authentication and browser automation for Suno.com integration.

## Features

- **Google OAuth 2.0**: Secure authentication for users
- **Suno.com Automation**: Browser automation using Playwright to interact with Suno.com
- **Session Management**: Maintains authenticated sessions for each user
- **Persona Management**: Access and apply user personas from Suno
- **Song Creation**: Automatically fill in lyrics, styles, genres, and create songs on Suno

## Prerequisites

- Node.js 18+ 
- Google Cloud OAuth 2.0 credentials
- Suno.com account

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install chromium
```

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3001/auth/google/callback`
7. Copy Client ID and Client Secret

### 4. Environment Variables

Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Session Secret (use a long random string in production)
SESSION_SECRET=your-session-secret-here-change-this-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Suno Configuration
SUNO_BASE_URL=https://suno.com
```

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will run on `http://localhost:3001` by default.

## API Endpoints

### Authentication

- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/status` - Check authentication status
- `POST /auth/logout` - Logout from Google OAuth

### Suno Integration

- `POST /api/suno/login` - Login to Suno.com (requires authentication)
- `POST /api/suno/create-song` - Create a song on Suno.com
- `GET /api/suno/personas` - Fetch available personas from Suno
- `POST /api/suno/logout` - Logout from Suno.com

### Health Check

- `GET /health` - Server health check

## Usage Flow

1. User clicks "Login with Google" in the frontend
2. User is redirected to Google OAuth consent screen
3. After approval, user is redirected back to frontend
4. Frontend shows "Connect to Suno" button
5. Backend opens browser and logs into Suno.com using user's Google account
6. User can now create songs directly on Suno.com through the API
7. Backend fills in lyrics, style, genres, personas, and creates the song

## Security Notes

- Sessions are stored in memory by default (use Redis in production)
- API key is never exposed to frontend
- Browser sessions are isolated per user
- All routes except auth endpoints require authentication

## Troubleshooting

### "Backend service is not available"

Make sure the server is running:
```bash
cd server
npm start
```

### "Failed to login to Suno"

- Check that your Google account has access to Suno.com
- Verify Suno.com is accessible
- Check browser logs for automation errors

### OAuth Redirect Issues

- Verify redirect URI in Google Cloud Console matches exactly
- Check that frontend URL is correct in `.env`

## Production Deployment

For production:

1. Use HTTPS for all URLs
2. Set `NODE_ENV=production`
3. Use a strong `SESSION_SECRET`
4. Configure session store (e.g., Redis)
5. Run browser in headless mode
6. Set up proper error monitoring
7. Configure rate limiting
8. Use environment-specific OAuth credentials

## License

MIT License - Copyright GitHub, Inc.
