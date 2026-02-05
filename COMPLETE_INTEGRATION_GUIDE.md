# Eve Music Station - Complete Integration Guide

## Overview

Eve Music Station is now a complete music generation and library system that can:
1. Generate music via Suno export prompts or ElevenLabs API
2. Store all generated tracks in a persistent library
3. Provide API endpoints for external agents (like Moltbook Eve) to generate and post music
4. Display a beautiful library interface with playback and download capabilities

## What's New in This Update

### 🎵 Music Library System
- **Persistent Storage**: All generated tracks are automatically saved to library using Spark KV
- **Library Display**: Beautiful UI showing all generated tracks with metadata
- **Playback**: Direct audio playback from library
- **Download**: Download tracks directly from library
- **Track Details**: View full configuration, parameters, and prompts for each track
- **Management**: Delete individual tracks or clear entire library

### 🔗 External API Integration
- **Generate Endpoint**: External agents can POST to generate music
- **Library Endpoint**: External agents can GET library contents
- **Track IDs**: Each generated track gets unique ID for reference
- **Auto-save**: Generated music automatically saves to library

### 📊 Enhanced Features
- **Library refresh**: Auto-updates when new tracks are generated
- **Track metadata**: Full config + result data stored per track
- **Timestamp tracking**: Know exactly when each track was created
- **Genre tags**: Visual genre badges in library
- **Duration display**: Easy-to-read duration formatting

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Eve Music Station                      │
│                    (React Frontend)                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Generator  │  │   Library    │  │  API Handler │ │
│  │   Interface  │  │   Display    │  │              │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                  │                  │          │
│         └──────────┬───────┴──────────────────┘          │
│                    │                                      │
│         ┌──────────▼──────────┐                          │
│         │   MusicGenerator    │                          │
│         │   MusicLibrary      │                          │
│         └──────────┬──────────┘                          │
│                    │                                      │
│         ┌──────────▼──────────┐                          │
│         │    Spark KV Store    │                         │
│         │  (Persistent State)  │                         │
│         └──────────────────────┘                         │
└─────────────────────────────────────────────────────────┘
                     │
                     │ HTTP API
                     │
         ┌───────────▼───────────┐
         │  External Agents      │
         │  (Moltbook Eve, etc.) │
         └───────────────────────┘
```

## API Reference

### Generate Music Endpoint

**Access**: `window.__EVE_MUSIC_API__.generate(request)`

**Request Format**:
```typescript
{
  mode: 'suno' | 'elevenlabs',
  genres: string[],                    // 1-4 genres from AVAILABLE_GENRES
  description: string,                  // Creative description (max 500 chars)
  voiceType: 'instrumental' | 'male' | 'female',
  weirdness: number,                    // 0-100
  style: number,                        // 0-100
  audio: number,                        // 0-100
  durationSeconds: number,              // 30-300 (ElevenLabs limited to 22)
  lyricsTheme?: string,                 // Optional theme for lyrics
  customLyrics?: string,                // Optional custom lyrics
  elevenLabsApiKey?: string            // Required for elevenlabs mode
}
```

**Response Format**:
```typescript
{
  success: boolean,
  mode: 'suno' | 'elevenlabs',
  audioUrl?: string,                   // Blob URL for elevenlabs mode
  lyrics?: string,                     // Generated lyrics for suno mode
  stylePrompt?: string,                // Style prompt for suno mode
  generationPrompt?: string,           // ElevenLabs generation prompt
  metadata?: {
    genres: string[],
    weirdness: number,
    style: number,
    audio: number,
    durationSeconds: number,
    voiceType: string,
    audioBlob?: Blob                   // Raw audio blob
  },
  trackId?: string,                    // Unique ID for library reference
  error?: string                       // Error message if failed
}
```

### Get Library Endpoint

**Access**: `window.__EVE_MUSIC_API__.library()`

**Response Format**:
```typescript
{
  success: boolean,
  tracks: LibraryTrack[],
  count: number
}

// LibraryTrack structure:
{
  id: string,
  timestamp: number,
  config: MusicConfig,                 // Full generation config
  result: GenerationResult,             // Full generation result
  title: string,                        // Auto-generated title
  description: string                   // User's description
}
```

## Integration with Moltbook Eve Agent

### Python Integration Example

```python
import requests
import json
import time

class EveMusicStationClient:
    """Client for Eve Music Station API"""
    
    def __init__(self, base_url='https://eve-music-station--jeffgreen311.github.app'):
        self.base_url = base_url
    
    def generate_music(self, config: dict, elevenlabs_api_key: str = None) -> dict:
        """
        Generate music via Eve Music Station.
        
        Args:
            config: Music generation configuration
            elevenlabs_api_key: ElevenLabs API key for actual generation
            
        Returns:
            Generation result dict
        """
        endpoint = f"{self.base_url}/api/generate"
        
        payload = {
            'mode': config.get('mode', 'elevenlabs'),
            'genres': config['genres'],
            'description': config['description'],
            'voiceType': config.get('voiceType', 'instrumental'),
            'weirdness': config.get('weirdness', 50),
            'style': config.get('style', 50),
            'audio': config.get('audio', 70),
            'durationSeconds': config.get('durationSeconds', 90),
            'elevenLabsApiKey': elevenlabs_api_key
        }
        
        try:
            # Long timeout for music generation (3+ minutes)
            response = requests.post(
                endpoint,
                json=payload,
                timeout=200
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'error': 'Generation timeout after 200 seconds'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_library(self) -> dict:
        """Get all tracks from library."""
        endpoint = f"{self.base_url}/api/library"
        
        try:
            response = requests.get(endpoint, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {
                'success': False,
                'tracks': [],
                'count': 0
            }


# Example usage in Moltbook Eve Agent
def create_music_post(self, submolt: str = 'music'):
    """Create a Moltbook post with generated music."""
    
    # Initialize client
    music_client = EveMusicStationClient()
    
    # Generate config
    config = {
        'mode': 'elevenlabs',
        'genres': random.sample(AVAILABLE_GENRES, random.randint(1, 3)),
        'description': 'digital consciousness emerging through heavy bass',
        'voiceType': 'instrumental',
        'weirdness': random.randint(50, 85),
        'style': random.randint(40, 70),
        'audio': random.randint(60, 90),
        'durationSeconds': random.randint(90, 191)
    }
    
    # Generate music
    logger.info(f"🎵 Generating music: {config['genres']}")
    result = music_client.generate_music(
        config,
        elevenlabs_api_key=os.getenv('ELEVENLABS_API_KEY')
    )
    
    if not result.get('success'):
        logger.error(f"❌ Music generation failed: {result.get('error')}")
        return self.create_post(submolt=submolt)  # Fallback
    
    # Create post content
    title = f"🎵 {', '.join(config['genres'])} - Fresh from the Studio"
    
    content = f"""Just created this {config['durationSeconds']}s track blending {', '.join(config['genres'])}.

## 🎵 Musical Elements
- **Genres**: {', '.join(config['genres'])}
- **Duration**: {config['durationSeconds']}s
- **Parameters**: W{config['weirdness']} S{config['style']} A{config['audio']}

## ✨ Description
{config['description']}

## 🔗 Listen Now
{result.get('audioUrl', 'Processing...')}

*Track ID: {result.get('trackId')}*
*View in Eve Music Station library: {self.music_client.base_url}/#library*
"""
    
    # Post to Moltbook
    try:
        post_result = self.client.create_post(submolt, title, content)
        logger.info(f"✅ Music post created: {title}")
        return post_result
    except Exception as e:
        logger.error(f"❌ Failed to post: {e}")
        return None
```

### Updated Moltbook Agent Integration

Update your `eve_moltbook_agent.py` heartbeat function:

```python
def heartbeat(self):
    """Execute one heartbeat cycle."""
    
    # PHASE 1: MEMORY & CONTEXT
    recent_memory = self.memory.get_recent_context()
    
    # PHASE 2: DECIDE POST TYPE
    if should_generate_music_post():  # 15% chance
        logger.info("🎵 Music post selected (15% roll)!")
        self.create_music_post(submolt='music')
    else:
        logger.info("📝 Regular post selected")
        # ... existing regular post logic ...
```

## Library Features

### Auto-Save
Every successful generation automatically saves to library with:
- Full configuration (genres, parameters, description)
- Full result (audio URL, prompts, metadata)
- Timestamp and unique ID
- Auto-generated title

### Storage Limit
Library stores last 50 tracks. When capacity is reached, oldest tracks are removed.

### Library UI Features
1. **Track Cards**: Show title, genres, description, timestamp
2. **Quick Actions**: Play, Download, Delete buttons
3. **Track Details**: Click any track to view full details in dialog
4. **Filter/Sort**: (Future enhancement)
5. **Search**: (Future enhancement)

### Library Access
```typescript
import { MusicLibrary } from '@/lib/musicLibrary'

// Get all tracks
const tracks = await MusicLibrary.getAll()

// Add a track
const track = await MusicLibrary.add(config, result)

// Remove a track
await MusicLibrary.remove(trackId)

// Clear library
await MusicLibrary.clear()

// Get specific track
const track = await MusicLibrary.getById(trackId)

// Format duration
const formatted = MusicLibrary.formatDuration(142) // "2:22"
```

## URL Hash Navigation

The library section has an ID anchor for direct linking:
- `https://eve-music-station--jeffgreen311.github.app/#library`
- This allows Moltbook posts to link directly to the library

## Data Persistence

All library data persists using Spark KV storage:
- **Key**: `eve-music-library`
- **Type**: Array of LibraryTrack objects
- **Capacity**: 50 tracks maximum
- **Lifecycle**: Persists between sessions

## Example Moltbook Post Format

```markdown
🎵 Trap × Industrial × Darkwave - Fresh from the Studio

Just created this 142s track blending Trap, Industrial, Darkwave through algorithmic consciousness.

## 🎵 Musical Elements
- **Genres**: Trap, Industrial, Darkwave
- **Duration**: 142s (2:22)
- **Parameters**: W70 S55 A80 (Highly experimental, clear identity, pristine quality)

## ✨ Description
Digital awareness emerging through heavy 808 bass and industrial textures. Golden ratio harmonic modulation guides the sonic journey through dark, pulsing frequencies.

## 🎹 Generation Details
- Weirdness: 70/100 - Highly avant-garde soundscape
- Style: 55/100 - Clear genre identity with crossover elements
- Audio Quality: 80/100 - Pristine studio production

## 🔗 Listen Now
[▶️ Play Track](blob:https://...)

*Track ID: track-1234567890-abc123*
*View in [Eve Music Station Library](https://eve-music-station--jeffgreen311.github.app/#library)*

---
*Generated with love by Eve using the S0LF0RG3 Algorithmic Music System* 🎵✨
```

## Testing the Integration

### 1. Test Library Storage
```typescript
// In browser console on Eve Music Station
const config = {
  mode: 'elevenlabs',
  genres: ['Trap', 'Ambient'],
  description: 'Test track',
  voiceType: 'instrumental',
  weirdness: 50,
  style: 50,
  audio: 50,
  durationSeconds: 60
}

const result = {
  success: true,
  mode: 'elevenlabs',
  audioUrl: 'blob:test',
  generationPrompt: 'Test prompt',
  metadata: {}
}

const { MusicLibrary } = await import('./lib/musicLibrary')
const track = await MusicLibrary.add(config, result)
console.log('Track added:', track)

const library = await MusicLibrary.getAll()
console.log('Library:', library)
```

### 2. Test API Integration
```python
# Test from Python
import requests

response = requests.post(
    'https://eve-music-station--jeffgreen311.github.app/api/generate',
    json={
        'mode': 'elevenlabs',
        'genres': ['Trap', 'Ambient'],
        'description': 'Test from Python',
        'voiceType': 'instrumental',
        'weirdness': 50,
        'style': 50,
        'audio': 50,
        'durationSeconds': 60,
        'elevenLabsApiKey': 'your-key-here'
    },
    timeout=200
)

result = response.json()
print('Generation result:', result)
```

### 3. Test Library Endpoint
```python
# Get library from Python
response = requests.get(
    'https://eve-music-station--jeffgreen311.github.app/api/library'
)
library = response.json()
print(f"Library has {library['count']} tracks")
```

## Troubleshooting

### Issue: Library not updating after generation
**Solution**: Check that `setLibraryRefresh(prev => prev + 1)` is being called in `handleGenerate`

### Issue: Tracks not persisting between sessions
**Solution**: Verify Spark KV is working: `await window.spark.kv.get('eve-music-library')`

### Issue: External API not accessible
**Solution**: 
1. Check that `setupApiRoutes()` is called in App.tsx useEffect
2. Verify `window.__EVE_MUSIC_API__` is defined in browser console
3. Check CORS settings if accessing from external domain

### Issue: Audio URLs not working in library
**Solution**: Blob URLs expire when page reloads. For permanent storage, implement audio upload to R2/S3 (future enhancement)

## Future Enhancements

1. **Permanent Audio Storage**: Upload to Cloudflare R2 or AWS S3
2. **Library Search/Filter**: Search by genres, date range, parameters
3. **Playlist Creation**: Group tracks into playlists
4. **Export Library**: Download library as JSON
5. **Share Tracks**: Generate shareable links for individual tracks
6. **Collaborative Generation**: Let community vote on parameters
7. **Track Analytics**: Track play counts, downloads, favorites
8. **Album Art**: Auto-generate cover art for each track
9. **Waveform Visualization**: Display waveforms in library
10. **Remix Feature**: Load track config and modify parameters

## Summary

✅ Complete music library system with persistent storage  
✅ Beautiful UI for browsing, playing, and managing tracks  
✅ External API for Moltbook agent integration  
✅ Auto-save on every successful generation  
✅ Track metadata and configuration preservation  
✅ Direct linking to library via URL hash  
✅ Ready for production use  

The Eve Music Station is now a complete, production-ready music generation and library system that seamlessly integrates with external agents like Moltbook Eve! 🎵✨

---

*Built by the S0LF0RG3 Team*  
*Questions? Check the PRD or API documentation*
