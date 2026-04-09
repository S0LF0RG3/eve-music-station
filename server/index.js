import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { chromium } from 'playwright';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { Tokens } from 'csrf';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CSRF token generator
const tokens = new Tokens();
const csrfSecret = tokens.secretSync();

// Store active browser sessions for each user
const userSessions = new Map();

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later'
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'eve-music-station-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: 'lax'
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// CSRF protection middleware
const csrfProtection = (req, res, next) => {
  // Skip CSRF check for GET requests and health endpoint
  if (req.method === 'GET' || req.path === '/health') {
    return next();
  }
  
  const token = req.headers['csrf-token'];
  if (!token || !tokens.verify(csrfSecret, token)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  next();
};

// Passport Configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  // Store user profile
  const user = {
    id: profile.id,
    email: profile.emails?.[0]?.value,
    name: profile.displayName,
    accessToken
  };
  return done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Authentication Routes
app.get('/auth/google',
  authLimiter,
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

app.get('/auth/google/callback',
  authLimiter,
  passport.authenticate('google', { failureRedirect: '/auth/failure' }),
  (req, res) => {
    // Redirect to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}?auth=success`);
  }
);

app.get('/auth/failure', (req, res) => {
  res.status(401).json({ error: 'Authentication failed' });
});

app.get('/auth/status', apiLimiter, (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        name: req.user.name,
        email: req.user.email
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// CSRF token endpoint
app.get('/auth/csrf-token', (req, res) => {
  const token = tokens.create(csrfSecret);
  res.json({ csrfToken: token });
});

app.post('/auth/logout', csrfProtection, (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// Suno Automation Routes
app.post('/api/suno/login', apiLimiter, requireAuth, csrfProtection, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user already has an active session
    if (userSessions.has(userId)) {
      return res.json({ 
        success: true, 
        message: 'Already logged in to Suno' 
      });
    }

    // Launch browser and navigate to Suno
    const browser = await chromium.launch({ 
      headless: process.env.NODE_ENV === 'production'
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('https://suno.com');
    
    // Wait for the login button and click it
    await page.waitForSelector('text=Sign in', { timeout: 10000 });
    await page.click('text=Sign in');
    
    // Click "Continue with Google"
    await page.waitForSelector('button:has-text("Continue with Google")', { timeout: 10000 });
    await page.click('button:has-text("Continue with Google")');
    
    // Handle Google OAuth popup
    const popupPromise = page.waitForEvent('popup');
    const popup = await popupPromise;
    
    // Fill in Google credentials (if needed)
    // Note: In production, you might want to handle this differently
    // as Google may block automated login
    
    // Wait for successful login redirect back to Suno
    await page.waitForURL('**/create**', { timeout: 60000 });
    
    // Store the session
    userSessions.set(userId, { browser, context, page });
    
    res.json({ 
      success: true, 
      message: 'Successfully logged in to Suno' 
    });
  } catch (error) {
    console.error('Suno login error:', error);
    res.status(500).json({ 
      error: 'Failed to login to Suno', 
      details: error.message 
    });
  }
});

app.post('/api/suno/create-song', apiLimiter, requireAuth, csrfProtection, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      lyrics, 
      stylePrompt, 
      genres,
      persona,
      weirdness,
      style,
      audioQuality,
      songTitle 
    } = req.body;
    
    // Input validation
    if (!songTitle || typeof songTitle !== 'string' || songTitle.length > 100) {
      return res.status(400).json({ 
        error: 'Invalid song title. Must be a string with max 100 characters.' 
      });
    }
    
    if (lyrics && typeof lyrics !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid lyrics. Must be a string.' 
      });
    }
    
    if (stylePrompt && typeof stylePrompt !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid style prompt. Must be a string.' 
      });
    }
    
    if (genres && (!Array.isArray(genres) || genres.some(g => typeof g !== 'string'))) {
      return res.status(400).json({ 
        error: 'Invalid genres. Must be an array of strings.' 
      });
    }
    
    if (weirdness !== undefined && (typeof weirdness !== 'number' || weirdness < 0 || weirdness > 100)) {
      return res.status(400).json({ 
        error: 'Invalid weirdness. Must be a number between 0-100.' 
      });
    }
    
    if (style !== undefined && (typeof style !== 'number' || style < 0 || style > 100)) {
      return res.status(400).json({ 
        error: 'Invalid style. Must be a number between 0-100.' 
      });
    }
    
    if (audioQuality !== undefined && (typeof audioQuality !== 'number' || audioQuality < 0 || audioQuality > 100)) {
      return res.status(400).json({ 
        error: 'Invalid audioQuality. Must be a number between 0-100.' 
      });
    }
    
    // Check if user has an active Suno session
    if (!userSessions.has(userId)) {
      return res.status(400).json({ 
        error: 'Not logged in to Suno. Please login first.' 
      });
    }
    
    const { page } = userSessions.get(userId);
    
    // Navigate to create page if not already there
    if (!page.url().includes('/create')) {
      await page.goto('https://suno.com/create');
      await page.waitForLoadState('networkidle');
    }
    
    // Fill in song title
    // Note: These selectors are specific to Suno's current UI (as of 2026)
    // If Suno changes their interface, these selectors will need to be updated
    if (songTitle) {
      const titleInput = await page.locator('input[placeholder*="title"]').first();
      await titleInput.fill(songTitle);
    }
    
    // Fill in lyrics
    if (lyrics) {
      const lyricsTextarea = await page.locator('textarea[placeholder*="lyrics"]').first();
      await lyricsTextarea.fill(lyrics);
    }
    
    // Fill in style prompt
    if (stylePrompt) {
      const styleInput = await page.locator('input[placeholder*="style"], textarea[placeholder*="style"]').first();
      await styleInput.fill(stylePrompt);
    }
    
    // Select genres (if applicable)
    if (genres && genres.length > 0) {
      for (const genre of genres) {
        // This selector will depend on Suno's actual UI structure
        const genreButton = await page.locator(`button:has-text("${genre}")`).first();
        if (await genreButton.isVisible()) {
          await genreButton.click();
        }
      }
    }
    
    // Apply persona (if applicable)
    if (persona) {
      const personaDropdown = await page.locator('select[name="persona"], button:has-text("persona")').first();
      if (await personaDropdown.isVisible()) {
        await personaDropdown.click();
        await page.locator(`text=${persona}`).click();
      }
    }
    
    // Adjust sliders
    if (weirdness !== undefined) {
      await adjustSlider(page, 'weirdness', weirdness);
    }
    if (style !== undefined) {
      await adjustSlider(page, 'style', style);
    }
    if (audioQuality !== undefined) {
      await adjustSlider(page, 'audio', audioQuality);
    }
    
    // Click create/generate button
    const createButton = await page.locator('button:has-text("Create"), button:has-text("Generate")').first();
    await createButton.click();
    
    // Wait for generation to complete
    await page.waitForSelector('text=Created', { timeout: 120000 });
    
    res.json({ 
      success: true, 
      message: 'Song created successfully on Suno' 
    });
  } catch (error) {
    console.error('Suno create song error:', error);
    res.status(500).json({ 
      error: 'Failed to create song on Suno', 
      details: error.message 
    });
  }
});

app.get('/api/suno/personas', apiLimiter, requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!userSessions.has(userId)) {
      return res.status(400).json({ 
        error: 'Not logged in to Suno. Please login first.' 
      });
    }
    
    const { page } = userSessions.get(userId);
    
    // Navigate to create page to access personas
    await page.goto('https://suno.com/create');
    await page.waitForLoadState('networkidle');
    
    // Extract personas list (this will depend on Suno's actual UI)
    const personas = await page.evaluate(() => {
      const personaElements = document.querySelectorAll('[data-persona], .persona-item');
      return Array.from(personaElements).map(el => ({
        name: el.textContent?.trim(),
        value: el.getAttribute('data-value') || el.textContent?.trim()
      }));
    });
    
    res.json({ success: true, personas });
  } catch (error) {
    console.error('Fetch personas error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch personas', 
      details: error.message 
    });
  }
});

app.post('/api/suno/logout', apiLimiter, requireAuth, csrfProtection, async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (userSessions.has(userId)) {
      const { browser } = userSessions.get(userId);
      await browser.close();
      userSessions.delete(userId);
    }
    
    res.json({ success: true, message: 'Logged out from Suno' });
  } catch (error) {
    console.error('Suno logout error:', error);
    res.status(500).json({ 
      error: 'Failed to logout from Suno', 
      details: error.message 
    });
  }
});

// Helper function to adjust sliders
async function adjustSlider(page, sliderName, value) {
  try {
    // Find slider by label or aria-label
    const slider = await page.locator(`input[type="range"][aria-label*="${sliderName}"], input[type="range"][name*="${sliderName}"]`).first();
    if (await slider.isVisible()) {
      await slider.fill(value.toString());
    }
  } catch (error) {
    console.warn(`Could not adjust ${sliderName} slider:`, error.message);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Eve Music Station backend running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

// Cleanup on shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  for (const [userId, session] of userSessions) {
    try {
      await session.browser.close();
    } catch (error) {
      console.error(`Error closing browser for user ${userId}:`, error);
    }
  }
  process.exit(0);
});
