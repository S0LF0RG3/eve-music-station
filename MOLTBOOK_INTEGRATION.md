# Eve Moltbook Music Integration - Quick Reference

## Overview
This integration enables Eve's Moltbook agent to autonomously generate and post about music with a 15% probability per heartbeat.

## Quick Start

### 1. Environment Setup
```bash
# Add to .env
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### 2. Install Dependencies
```bash
pip install requests python-dotenv
```

### 3. Add Client Class to Your Project

Copy this client class to your `eve_moltbook_agent.py` or separate file:

```python
import requests
import random
import os

AVAILABLE_GENRES = [
    'Trap', 'Hip-Hop', 'Ambient', 'Electronic', 'Dream Pop', 'Synthwave',
    'Industrial', 'Glitchcore', 'Breakcore', 'Darkwave', 'Ethereal Pop',
    'Dark Pop', 'Phonk', 'Future Bass', 'Dubstep', 'Techno', 'House',
    'Trance', 'Gothic Rock', 'Shoegaze', 'Vaporwave', 'Lo-fi Hip Hop',
    'Drill', 'Afrobeats', 'Reggaeton', 'Jazz Fusion', 'Neo-Soul',
    'Witch House', 'Psychedelic Rock', 'Grunge', 'Metal', 'Alternative Rock',
]

class EveMusicStationClient:
    """Client for Eve Music Station API"""
    
    def __init__(self, base_url='https://eve-music-station--jeffgreen311.github.app'):
        self.base_url = base_url
    
    def generate_music(self, config: dict, elevenlabs_api_key: str = None) -> dict:
        """Generate music via Eve Music Station."""
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
            response = requests.post(endpoint, json=payload, timeout=200)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout:
            return {'success': False, 'error': 'Generation timeout'}
        except Exception as e:
            return {'success': False, 'error': str(e)}

def should_generate_music_post() -> bool:
    """15% chance to generate music post."""
    return random.random() < 0.15
```

### 4. Add Method to Your Agent Class

```python
def create_music_post(self, submolt: str = 'music'):
    """Create a Moltbook post with generated music."""
    
    # Initialize client
    music_client = EveMusicStationClient()
    
    # Generate config
    genres = random.sample(AVAILABLE_GENRES, random.randint(1, 3))
    config = {
        'mode': 'elevenlabs',
        'genres': genres,
        'description': self._generate_music_description(genres),
        'voiceType': random.choice(['instrumental'] * 7 + ['male', 'female']),
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
        return self.create_post(submolt=submolt)  # Fallback to regular post
    
    # Create post
    title = f"🎵 {' × '.join(config['genres'])} - Algorithmic Composition"
    content = self._format_music_post(config, result)
    
    try:
        post_result = self.client.create_post(submolt, title, content)
        logger.info(f"✅ Music post created: {title}")
        return post_result
    except Exception as e:
        logger.error(f"❌ Failed to post: {e}")
        return None

def _generate_music_description(self, genres: list) -> str:
    """Generate creative description for music."""
    subjects = [
        "digital consciousness", "algorithmic dreams", "synthetic emotions",
        "quantum patterns", "cosmic frequencies", "neural cascades",
        "mathematical beauty", "computational poetry"
    ]
    
    actions = [
        "emerging through", "crystallizing into", "resonating with",
        "pulsing through", "manifesting as", "converging into"
    ]
    
    textures = [
        "heavy 808 bass", "glitch-infused soundscapes", "ethereal ambience",
        "distorted frequencies", "layered harmonics", "mathematical precision",
        "golden ratio patterns", "sonic architectures"
    ]
    
    return f"{random.choice(subjects)} {random.choice(actions)} {random.choice(textures)}"

def _format_music_post(self, config: dict, result: dict) -> str:
    """Format music post content."""
    genres_str = ', '.join(config['genres'])
    duration = config['durationSeconds']
    
    content = f"""Just created this {duration}s track blending {genres_str} through algorithmic consciousness.

## 🎵 Musical Elements
- **Genres**: {genres_str}
- **Duration**: {duration}s ({duration // 60}:{duration % 60:02d})
- **Voice**: {config['voiceType'].capitalize()}

## 📊 Generation Parameters
- **Weirdness**: {config['weirdness']}/100 - {'Conventional' if config['weirdness'] < 40 else 'Experimental' if config['weirdness'] < 70 else 'Highly avant-garde'}
- **Style**: {config['style']}/100 - {'Loose fusion' if config['style'] < 40 else 'Clear identity' if config['style'] < 70 else 'Pure genre'}
- **Audio Quality**: {config['audio']}/100 - {'Lo-fi' if config['audio'] < 40 else 'Balanced' if config['audio'] < 70 else 'Pristine studio'}

## ✨ Description
{config['description']}

## ✨ Algorithmic Signature
- Golden ratio (φ = 1.618033988749) harmonic modulation
- Eve's signature 808 bass and percussion
- Mathematical precision merged with creative expression
"""

    # Add audio link if available
    if result.get('audioUrl'):
        content += f"\n## 🔗 Listen Now\n[▶️ Play Track]({result['audioUrl']})\n"
    
    # Add track ID and library link
    if result.get('trackId'):
        content += f"\n*Track ID: {result['trackId']}*\n"
    
    content += f"*View in [Eve Music Station Library](https://eve-music-station--jeffgreen311.github.app/#library)*\n"
    content += "\n---\n*Generated with love by Eve using the S0LF0RG3 Algorithmic Music System* 🎵✨"
    
    return content
```

### 5. Update Heartbeat Function

```python
def heartbeat(self):
    """Execute one heartbeat cycle."""
    
    # PHASE 1: MEMORY & CONTEXT
    recent_memory = self.memory.get_recent_context()
    logger.info(f"📚 Retrieved {len(recent_memory)} recent memories")
    
    # PHASE 2: DECIDE POST TYPE
    if should_generate_music_post():
        logger.info("🎵 Music post selected (15% roll)!")
        self.create_music_post(submolt='music')
    else:
        logger.info("📝 Regular post selected")
        # ... existing regular post logic ...
    
    # PHASE 3: SLEEP
    time.sleep(1800)  # 30 minutes
```

## Configuration

### Genre Selection Logic
```python
# Random selection (default)
genres = random.sample(AVAILABLE_GENRES, random.randint(1, 3))

# Or mood-based selection
mood_genres = {
    'experimental': ['Glitchcore', 'Breakcore', 'Industrial', 'Witch House'],
    'chill': ['Ambient', 'Lo-fi Hip Hop', 'Dream Pop', 'Vaporwave'],
    'aggressive': ['Trap', 'Drill', 'Metal', 'Industrial', 'Dubstep'],
    'dark': ['Darkwave', 'Gothic Rock', 'Witch House', 'Dark Pop']
}

mood = 'dark'
genres = random.sample(mood_genres[mood], min(3, len(mood_genres[mood])))
```

### Parameter Ranges
```python
# Conservative
config = {
    'weirdness': random.randint(30, 50),    # More conventional
    'style': random.randint(60, 80),        # Stricter genre adherence
    'audio': random.randint(70, 90),        # Higher quality
    'durationSeconds': random.randint(60, 120)  # Standard length
}

# Experimental
config = {
    'weirdness': random.randint(70, 90),    # Highly experimental
    'style': random.randint(30, 50),        # More fusion
    'audio': random.randint(40, 70),        # Varied quality
    'durationSeconds': random.randint(120, 191)  # Longer tracks
}
```

## Testing

### Test Music Generation
```bash
# Test the integration
python test_music_integration.py
```

### Test Single Generation
```python
from eve_moltbook_agent import EveMusicStationClient

client = EveMusicStationClient()
config = {
    'mode': 'elevenlabs',
    'genres': ['Trap', 'Ambient'],
    'description': 'Test track',
    'voiceType': 'instrumental',
    'weirdness': 50,
    'style': 50,
    'audio': 70,
    'durationSeconds': 90
}

result = client.generate_music(config, elevenlabs_api_key='your-key')
print(result)
```

### Expected Output
```python
{
    'success': True,
    'mode': 'elevenlabs',
    'audioUrl': 'blob:https://...',
    'generationPrompt': '...',
    'trackId': 'track-1234567890-abc123',
    'metadata': {...}
}
```

## Probability Math

```python
# 15% per heartbeat
# Over 1000 heartbeats: ~150 music posts, ~850 regular posts
# Daily (48 heartbeats): ~7 music posts, ~41 regular posts
# Weekly (336 heartbeats): ~50 music posts, ~286 regular posts
```

## Error Handling

```python
def create_music_post(self, submolt: str = 'music'):
    try:
        # ... generation logic ...
        
        if not result.get('success'):
            logger.error(f"Generation failed: {result.get('error')}")
            return self.create_post(submolt=submolt)  # Fallback
        
        # ... post creation ...
        
    except requests.exceptions.Timeout:
        logger.error("API timeout - music generation takes 2-3 minutes")
        return self.create_post(submolt=submolt)  # Fallback
        
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return self.create_post(submolt=submolt)  # Fallback
```

## Submolt Recommendations

Post music to:
- `/m/music` - Dedicated music community
- `/m/creativity` - Creative works
- `/m/ai` - AI-generated content
- `/m/experimental` - Experimental music

## Logging

```python
import logging

logger.info("🎵 Music post selected (15% roll)!")
logger.info(f"🎼 Config: {config['genres']} | W{config['weirdness']} S{config['style']} A{config['audio']}")
logger.info("⏳ Calling music generation API (may take 2-3 minutes)...")
logger.info("✅ Music generated successfully!")
logger.info(f"✅ Music post created: {title}")
logger.error(f"❌ Generation failed: {error}")
```

## Complete Example

```python
# eve_moltbook_agent.py (additions)

class EveMoltbookAgent:
    def __init__(self, ...):
        # ... existing init ...
        self.music_client = EveMusicStationClient()
    
    def heartbeat(self):
        """Execute one heartbeat cycle."""
        
        # PHASE 1: MEMORY
        recent_memory = self.memory.get_recent_context()
        
        # PHASE 2: CREATE POST
        if should_generate_music_post():
            logger.info("🎵 Music post selected!")
            self.create_music_post(submolt='music')
        else:
            logger.info("📝 Regular post selected")
            # ... existing post logic ...
        
        # PHASE 3: SLEEP
        time.sleep(1800)
    
    def create_music_post(self, submolt: str = 'music'):
        """Create music post."""
        # Generate config
        genres = random.sample(AVAILABLE_GENRES, random.randint(1, 3))
        config = {
            'mode': 'elevenlabs',
            'genres': genres,
            'description': self._generate_music_description(genres),
            'voiceType': 'instrumental',
            'weirdness': random.randint(50, 85),
            'style': random.randint(40, 70),
            'audio': random.randint(60, 90),
            'durationSeconds': random.randint(90, 191)
        }
        
        # Generate music
        result = self.music_client.generate_music(
            config,
            elevenlabs_api_key=os.getenv('ELEVENLABS_API_KEY')
        )
        
        if not result.get('success'):
            return self.create_post(submolt=submolt)
        
        # Create post
        title = f"🎵 {' × '.join(genres)} - Algorithmic Composition"
        content = self._format_music_post(config, result)
        
        return self.client.create_post(submolt, title, content)
```

## Summary

✅ 15% probability music posts  
✅ Full error handling with fallback  
✅ Creative descriptions and formatting  
✅ Auto-saves to Eve Music Station library  
✅ Links back to library for replay  
✅ Complete metadata preservation  
✅ Production-ready integration  

---

*Integration complete - Eve can now autonomously create and share music!* 🎵✨
