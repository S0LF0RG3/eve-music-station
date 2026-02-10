# Suno.com Direct Integration Guide

This guide explains how to use the Google OAuth and browser automation features to create songs directly on Suno.com from the Eve Music Station.

## Overview

The Suno Direct Integration allows you to:
- Login to Suno.com using your Google account via OAuth
- Automatically create songs on Suno.com with generated lyrics and styles
- Access and apply your Suno personas
- Use the app's slider controls (weirdness, style, audio) to configure Suno's settings
- Generate and apply song titles automatically

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Eve Music Station                         │
│                      (React Frontend)                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Suno Auth Panel                                      │  │
│  │  - Login with Google                                  │  │
│  │  - Connect to Suno                                    │  │
│  │  - Persona Selector                                   │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
└─────────────────────┼────────────────────────────────────────┘
                      │ HTTPS/REST
                      │
┌─────────────────────▼────────────────────────────────────────┐
│                  Backend Service                             │
│                  (Node.js + Express)                         │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ OAuth Handler   │  │ Session Manager │  │ Suno API    │ │
│  │ (Passport.js)   │  │                 │  │ (Playwright)│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────┬────────────────────────────────────────┘
                      │ Browser Automation
                      │
┌─────────────────────▼────────────────────────────────────────┐
│                      Suno.com                                │
│                                                              │
│  - Google OAuth Login                                        │
│  - Song Creation Interface                                  │
│  - Persona Management                                        │
│  - Style and Genre Controls                                 │
└──────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### Prerequisites

1. Node.js 18 or higher
2. Google Cloud account for OAuth credentials
3. Suno.com account that supports Google login

### Step 1: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Configure OAuth consent screen:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type
   - Fill in app name, support email, and developer contact
   - Add scopes: `email`, `profile`
   - Add test users if in development
5. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "Eve Music Station"
   - Authorized redirect URIs:
     - Development: `http://localhost:3001/auth/google/callback`
     - Production: `https://your-domain.com/auth/google/callback`
6. Copy the Client ID and Client Secret

### Step 2: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 3: Install Playwright Browsers

```bash
npx playwright install chromium
```

This downloads the Chromium browser needed for automation.

### Step 4: Configure Environment Variables

```bash
cd server
cp .env.example .env
```

Edit `.env`:

```env
PORT=3001
NODE_ENV=development

# From Google Cloud Console
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here

GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Generate a random string for production
SESSION_SECRET=change-this-to-a-random-string-in-production

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Suno base URL
SUNO_BASE_URL=https://suno.com
```

### Step 5: Configure Frontend

```bash
# From project root
cp .env.example .env
```

The default configuration should work for local development.

### Step 6: Start the Backend

```bash
cd server
npm start
```

You should see:
```
Eve Music Station backend running on port 3001
Frontend URL: http://localhost:5173
```

### Step 7: Start the Frontend

```bash
# From project root
npm run dev
```

## Usage

### 1. Authenticate with Google

1. Open the Eve Music Station app
2. Select "Suno Export" mode
3. Click "Login with Google" in the Suno Integration panel
4. You'll be redirected to Google's OAuth consent screen
5. Approve the permissions
6. You'll be redirected back to the app

### 2. Connect to Suno

1. After Google authentication, click "Connect to Suno"
2. The backend will:
   - Open a browser (visible in development)
   - Navigate to Suno.com
   - Click "Sign in"
   - Click "Continue with Google"
   - Handle the Google OAuth flow
   - Wait for successful login to Suno
3. Once connected, you'll see "Connected to Suno.com" status

### 3. Enable Auto-Creation

1. Toggle "Auto-create on Suno.com" switch
2. Optionally select a persona from the dropdown
3. The persona list is fetched from your Suno account

### 4. Generate and Create Songs

1. Configure your song:
   - Select genres
   - Write a description
   - Adjust sliders (weirdness, style, audio)
   - Add lyrics theme or custom lyrics
   - Select voice type and vocal style
2. Click "Generate"
3. The app will:
   - Generate lyrics and style prompt locally
   - Generate a song title using AI
   - Submit everything to Suno.com automatically
   - Apply your selected persona
   - Map slider values to Suno's controls
   - Create the song
4. You'll see a success message when the song is created on Suno

## Features

### Persona Management

The app fetches your personas from Suno.com and displays them in a dropdown. Select a persona before generating to apply it to your song.

### Slider Mapping

The app's sliders are mapped to Suno's controls:
- **Weirdness (0-100)**: Controls experimental/conventional balance
- **Style (0-100)**: Controls genre adherence vs. fusion
- **Audio (0-100)**: Controls production quality

### Auto-Generated Song Titles

The app uses AI to generate creative song titles based on your lyrics and style. This happens automatically before submission to Suno.

### Session Management

Your Suno session persists as long as the backend is running. You can:
- Generate multiple songs without re-authenticating
- Close and reopen the frontend without losing session
- Click "Disconnect" to close the Suno session

## Troubleshooting

### "Backend service is not available"

**Problem**: Frontend can't connect to backend

**Solutions**:
1. Make sure backend is running: `cd server && npm start`
2. Check backend URL in `.env`: `VITE_BACKEND_URL=http://localhost:3001`
3. Verify no firewall is blocking port 3001

### "Failed to login to Suno"

**Problem**: Browser automation can't login to Suno

**Solutions**:
1. Check that Suno.com supports Google OAuth login
2. Verify your Google account has access to Suno
3. Check browser console in the automated browser for errors
4. Try logging into Suno.com manually with the same Google account first
5. Check that Suno's UI hasn't changed (may need to update selectors)

### "Authentication failed"

**Problem**: Google OAuth not working

**Solutions**:
1. Verify OAuth credentials in `.env` are correct
2. Check redirect URI matches exactly in Google Cloud Console
3. Make sure Google+ API is enabled
4. Verify the callback URL: `http://localhost:3001/auth/google/callback`
5. Clear browser cookies and try again

### "Failed to fetch personas"

**Problem**: Can't load personas from Suno

**Solutions**:
1. Ensure you're connected to Suno (green status indicator)
2. Check that your Suno account has personas
3. Look at browser automation logs for errors
4. Suno's persona UI may have changed (selectors need updating)

### Browser Automation Issues

**Problem**: Automated browser behaves unexpectedly

**Solutions**:
1. Set `headless: false` in `server/index.js` to watch the browser
2. Add delays if elements aren't loading fast enough
3. Update selectors if Suno's UI has changed
4. Check Playwright logs for specific errors

## Security Considerations

### Production Deployment

For production use:

1. **Use HTTPS everywhere**:
   ```env
   GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
   FRONTEND_URL=https://yourdomain.com
   ```

2. **Secure session secret**:
   ```env
   SESSION_SECRET=$(openssl rand -base64 32)
   ```

3. **Use Redis for sessions**:
   ```javascript
   const RedisStore = require('connect-redis').default
   const { createClient } = require('redis')
   
   const redisClient = createClient()
   redisClient.connect()
   
   app.use(session({
     store: new RedisStore({ client: redisClient }),
     ...
   }))
   ```

4. **Run browser in headless mode**:
   ```javascript
   const browser = await chromium.launch({ 
     headless: true 
   });
   ```

5. **Add rate limiting**:
   ```javascript
   const rateLimit = require('express-rate-limit')
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   })
   
   app.use('/api/', limiter)
   ```

6. **Environment-specific OAuth**:
   - Use different OAuth credentials for dev/staging/prod
   - Restrict authorized domains
   - Use different redirect URIs

### Data Privacy

- User Google credentials are never stored
- Sessions are isolated per user
- Browser contexts are destroyed after logout
- No sensitive data is logged

## API Reference

### Frontend Service (`SunoAuthService`)

```typescript
// Login with Google (redirects to OAuth)
SunoAuthService.loginWithGoogle()

// Check auth status
const status = await SunoAuthService.getAuthStatus()
// Returns: { authenticated: boolean, user?: { name, email } }

// Login to Suno
const result = await SunoAuthService.loginToSuno()
// Returns: { success: boolean, message: string }

// Create song on Suno
await SunoAuthService.createSong({
  lyrics: string,
  stylePrompt: string,
  genres: string[],
  persona?: string,
  weirdness: number,
  style: number,
  audioQuality: number,
  songTitle: string
})

// Get personas
const personas = await SunoAuthService.getPersonas()
// Returns: SunoPersona[]

// Logout from Suno
await SunoAuthService.logoutFromSuno()

// Logout from Google
await SunoAuthService.logout()
```

### Backend Endpoints

```
POST /auth/google              - Start OAuth flow
GET  /auth/google/callback     - OAuth callback
GET  /auth/status              - Check auth status
POST /auth/logout              - Logout

POST /api/suno/login           - Login to Suno (requires auth)
POST /api/suno/create-song     - Create song (requires auth)
GET  /api/suno/personas        - Get personas (requires auth)
POST /api/suno/logout          - Logout from Suno (requires auth)

GET  /health                   - Health check
```

## Advanced Configuration

### Custom Suno Selectors

If Suno's UI changes, you may need to update selectors in `server/index.js`:

```javascript
// Login button
await page.click('text=Sign in');

// Google OAuth button
await page.click('button:has-text("Continue with Google")');

// Create page
await page.waitForURL('**/create**');

// Input fields
const titleInput = await page.locator('input[placeholder*="title"]');
const lyricsTextarea = await page.locator('textarea[placeholder*="lyrics"]');
const styleInput = await page.locator('input[placeholder*="style"]');

// Sliders
const slider = await page.locator('input[type="range"][aria-label*="weirdness"]');
```

### Timeout Configuration

Adjust timeouts for slower connections:

```javascript
// Wait for login (default 60s)
await page.waitForURL('**/create**', { timeout: 120000 });

// Wait for song creation (default 120s)
await page.waitForSelector('text=Created', { timeout: 180000 });
```

## Development Tips

### Watch Browser Automation

Set `headless: false` to see what the browser is doing:

```javascript
const browser = await chromium.launch({ 
  headless: false,
  slowMo: 100  // Slow down by 100ms per action
});
```

### Debug Mode

Enable detailed logging:

```javascript
// In server/index.js
const DEBUG = process.env.DEBUG === 'true';

if (DEBUG) {
  console.log('Navigating to:', url);
  await page.screenshot({ path: 'debug.png' });
}
```

### Test Automation Without Frontend

Use the REST API directly:

```bash
# Start backend
cd server && npm start

# In another terminal, test with curl
curl -X POST http://localhost:3001/api/suno/login \
  -H "Cookie: connect.sid=YOUR_SESSION_ID"
```

## License

MIT License - Copyright GitHub, Inc.
