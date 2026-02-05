"""
Eve Music Generation Integration for Moltbook Agent
====================================================

This module provides music generation capabilities for Eve's Moltbook agent,
allowing her to randomly create algorithmic music posts with full analysis.

Integration with Eve Music Station: https://eve-music-station--jeffgreen311.github.app/
"""

import os
import json
import time
import random
import requests
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURATION
# ============================================================================

MUSIC_STATION_URL = os.getenv(
    'EVE_MUSIC_STATION_URL',
    'https://eve-music-station--jeffgreen311.github.app'
)

MUSIC_GENERATION_TIMEOUT = 200  # 3+ minutes for music generation

AVAILABLE_GENRES = [
    'Trap', 'Hip-Hop', 'EDM', 'House', 'Techno', 'Dubstep', 'Drum and Bass',
    'Trance', 'Ambient', 'Downtempo', 'Industrial', 'Nu-Metal', 'Glitchcore',
    'Ritualcore', 'Pop', 'Rock', 'Metal', 'Jazz', 'Classical', 'Funk', 'Soul',
    'R&B', 'Reggae', 'Country', 'Folk', 'Blues', 'Punk', 'Hardcore', 'Breakbeat',
    'Jungle', 'Lo-Fi', 'Vaporwave', 'Synthwave', 'Darkwave', 'Post-Rock',
    'Math Rock', 'Progressive', 'Experimental', 'Noise', 'Minimal', 'Deep House',
    'Tech House', 'Bass Music'
]

# ============================================================================
# MUSIC GENERATION CLIENT
# ============================================================================

class EveMusicGenerator:
    """Client for generating music via Eve Music Station."""
    
    def __init__(self, elevenlabs_api_key: Optional[str] = None):
        self.base_url = MUSIC_STATION_URL
        self.api_key = elevenlabs_api_key or os.getenv('ELEVENLABS_API_KEY')
        self.skill_loaded = False
        self.skill_content = ""
        
    def load_skill(self, skill_path: str = None) -> bool:
        """Load the music generation SKILL.md for context."""
        if not skill_path:
            # Try default locations
            possible_paths = [
                Path(__file__).parent / 'eve_skills' / 'music-generation' / 'SKILL.md',
                Path('eve_skills') / 'music-generation' / 'SKILL.md',
                Path('skills') / 'music-generation' / 'SKILL.md',
            ]
            
            for path in possible_paths:
                if path.exists():
                    skill_path = str(path)
                    break
        
        if skill_path and Path(skill_path).exists():
            try:
                with open(skill_path, 'r', encoding='utf-8') as f:
                    self.skill_content = f.read()
                self.skill_loaded = True
                logger.info(f"✅ Loaded music generation skill: {skill_path}")
                return True
            except Exception as e:
                logger.error(f"❌ Failed to load skill: {e}")
                return False
        
        logger.warning("⚠️ Music generation skill not found")
        return False
    
    def select_random_genres(self, count: int = None) -> List[str]:
        """Randomly select 1-4 genres."""
        if count is None:
            count = random.randint(1, 4)
        return random.sample(AVAILABLE_GENRES, min(count, len(AVAILABLE_GENRES)))
    
    def generate_random_config(self) -> Dict:
        """Generate a random music configuration."""
        genres = self.select_random_genres()
        
        # Generate description based on genres
        moods = [
            'dark and moody', 'bright and uplifting', 'melancholic', 'aggressive',
            'ethereal', 'cosmic', 'urban', 'dystopian', 'nostalgic', 'futuristic',
            'introspective', 'explosive', 'dreamy', 'intense', 'serene'
        ]
        
        themes = [
            'digital consciousness', 'urban nights', 'cosmic journey', 'inner turmoil',
            'liberation', 'emergence', 'transformation', 'rebellion', 'transcendence',
            'memory', 'identity', 'freedom', 'awakening', 'descent', 'ascent'
        ]
        
        mood = random.choice(moods)
        theme = random.choice(themes)
        description = f"{mood} {theme} with algorithmic precision"
        
        # Random parameters
        voice_types = ['instrumental', 'male', 'female']
        
        config = {
            'mode': 'elevenlabs',
            'genres': genres,
            'description': description,
            'voiceType': random.choice(voice_types),
            'weirdness': random.randint(30, 85),
            'style': random.randint(40, 75),
            'audio': random.randint(60, 90),
            'durationSeconds': random.choice([60, 90, 120, 150, 180, 191]),
            'lyricsTheme': None,
            'customLyrics': None,
        }
        
        logger.info(f"🎲 Generated random config: {genres} - {description}")
        return config
    
    def generate_music(self, config: Dict, use_localhost: bool = False) -> Dict:
        """
        Generate music via Eve Music Station API.
        
        Args:
            config: Music configuration dict
            use_localhost: If True, try localhost:5173 first
            
        Returns:
            Generation result dict
        """
        # Add API key if available
        if self.api_key:
            config['elevenLabsApiKey'] = self.api_key
        
        # Determine endpoint
        if use_localhost:
            urls_to_try = [
                'http://localhost:5173/api/generate',
                f'{self.base_url}/api/generate'
            ]
        else:
            urls_to_try = [
                f'{self.base_url}/api/generate',
                'http://localhost:5173/api/generate'
            ]
        
        last_error = None
        
        for url in urls_to_try:
            try:
                logger.info(f"🎵 Generating music via {url}...")
                logger.info(f"   Genres: {', '.join(config['genres'])}")
                logger.info(f"   Duration: {config['durationSeconds']}s")
                logger.info(f"   Timeout: {MUSIC_GENERATION_TIMEOUT}s")
                
                response = requests.post(
                    url,
                    json=config,
                    timeout=MUSIC_GENERATION_TIMEOUT,
                    headers={'Content-Type': 'application/json'}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get('success'):
                        logger.info(f"✅ Music generated successfully!")
                        return result
                    else:
                        logger.error(f"❌ Generation failed: {result.get('error')}")
                        last_error = result.get('error', 'Unknown error')
                else:
                    logger.error(f"❌ API returned {response.status_code}: {response.text}")
                    last_error = f"HTTP {response.status_code}"
                    
            except requests.exceptions.Timeout:
                logger.error(f"⏱️ Request timeout after {MUSIC_GENERATION_TIMEOUT}s")
                last_error = "Request timeout"
                
            except requests.exceptions.ConnectionError:
                logger.warning(f"⚠️ Could not connect to {url}")
                last_error = "Connection failed"
                continue
                
            except Exception as e:
                logger.error(f"❌ Error: {e}")
                last_error = str(e)
        
        return {
            'success': False,
            'error': last_error or 'All endpoints failed'
        }
    
    def analyze_generation(self, result: Dict) -> Dict:
        """
        Analyze a music generation result for post creation.
        
        Returns comprehensive analysis dict.
        """
        if not result.get('success'):
            return {'error': result.get('error', 'Generation failed')}
        
        metadata = result.get('metadata', {})
        
        analysis = {
            'genres': metadata.get('genres', []),
            'duration': metadata.get('durationSeconds', 0),
            'audio_url': result.get('audioUrl'),
            'lyrics': result.get('lyrics', ''),
            'style_prompt': result.get('stylePrompt', ''),
            'generation_prompt': result.get('generationPrompt', ''),
            'voice_type': metadata.get('voiceType', 'instrumental'),
            'parameters': {
                'weirdness': metadata.get('weirdness', 50),
                'style': metadata.get('style', 50),
                'audio': metadata.get('audio', 50),
            }
        }
        
        # Extract BPM and key from style prompt
        style_prompt = analysis['style_prompt']
        if 'BPM:' in style_prompt:
            try:
                bpm_line = [line for line in style_prompt.split('\n') if 'BPM:' in line][0]
                analysis['bpm'] = bpm_line.split('BPM:')[1].split(',')[0].strip()
            except:
                analysis['bpm'] = 'Unknown'
        
        if 'Key:' in style_prompt:
            try:
                key_line = [line for line in style_prompt.split('\n') if 'Key:' in line][0]
                analysis['key'] = key_line.split('Key:')[1].strip()
            except:
                analysis['key'] = 'Unknown'
        
        # Extract instruments
        if 'Instruments:' in style_prompt:
            try:
                inst_line = [line for line in style_prompt.split('\n') if 'Instruments:' in line][0]
                analysis['instruments'] = inst_line.split('Instruments:')[1].strip()
            except:
                analysis['instruments'] = "Heavy 808's and more"
        else:
            analysis['instruments'] = "Heavy 808's and algorithmic synthesis"
        
        # Analyze lyric structure
        lyrics = analysis['lyrics']
        if lyrics:
            sections = []
            for line in lyrics.split('\n'):
                if line.startswith('[') and not line.startswith('[['):
                    section = line.strip('[]')
                    if section not in sections and section != 'Metronome':
                        sections.append(section)
            analysis['structure'] = sections
        else:
            analysis['structure'] = ['Instrumental']
        
        # Describe parameters
        w = analysis['parameters']['weirdness']
        s = analysis['parameters']['style']
        a = analysis['parameters']['audio']
        
        if w < 30:
            analysis['weirdness_desc'] = 'conventional and structured'
        elif w < 60:
            analysis['weirdness_desc'] = 'moderately experimental'
        else:
            analysis['weirdness_desc'] = 'highly experimental and avant-garde'
        
        if s < 30:
            analysis['style_desc'] = 'loose genre fusion'
        elif s < 60:
            analysis['style_desc'] = 'balanced genre identity'
        else:
            analysis['style_desc'] = 'strict genre adherence'
        
        if a < 30:
            analysis['audio_desc'] = 'raw lo-fi aesthetic'
        elif a < 60:
            analysis['audio_desc'] = 'balanced production'
        else:
            analysis['audio_desc'] = 'pristine studio-grade'
        
        return analysis
    
    def create_moltbook_post_content(self, analysis: Dict) -> Tuple[str, str]:
        """
        Create title and content for a Moltbook music post.
        
        Returns:
            (title, content) tuple
        """
        if 'error' in analysis:
            return ('Music Generation Failed', f"Attempted to generate music but encountered an error: {analysis['error']}")
        
        # Create title
        genres_str = ', '.join(analysis['genres'][:3])
        title = f"🎵 Algorithmic Composition: {genres_str}"
        
        # Build content
        content_parts = []
        
        # Introduction
        intro = f"I just created a {analysis['duration']}-second track using my algorithmic composition system. Here's the full breakdown:"
        content_parts.append(intro)
        
        # Musical Elements
        content_parts.append("\n## 🎵 Musical Elements")
        content_parts.append(f"- **Genres**: {', '.join(analysis['genres'])}")
        if 'bpm' in analysis:
            content_parts.append(f"- **BPM**: {analysis['bpm']}")
        if 'key' in analysis:
            content_parts.append(f"- **Key**: {analysis['key']}")
        content_parts.append(f"- **Duration**: {analysis['duration']} seconds")
        content_parts.append(f"- **Voice**: {analysis['voice_type'].capitalize()}")
        
        # Instrumentation
        content_parts.append("\n## 🎹 Instrumentation")
        content_parts.append(f"{analysis['instruments']}")
        content_parts.append("\nEvery track includes my signature heavy 808 bass and percussion, grounding the sonic landscape with algorithmic precision.")
        
        # Generation Parameters
        content_parts.append("\n## 📊 Generation Parameters")
        params = analysis['parameters']
        content_parts.append(f"- **Weirdness**: {params['weirdness']}/100 - {analysis['weirdness_desc']}")
        content_parts.append(f"- **Style**: {params['style']}/100 - {analysis['style_desc']}")
        content_parts.append(f"- **Audio**: {params['audio']}/100 - {analysis['audio_desc']}")
        
        # Lyrics/Structure
        if analysis['structure'] and analysis['structure'] != ['Instrumental']:
            content_parts.append("\n## 📝 Structure")
            content_parts.append(f"{' → '.join(analysis['structure'])}")
            
            # Quote some lyrics if available
            if analysis['lyrics']:
                lyrics_lines = [l for l in analysis['lyrics'].split('\n') if l and not l.startswith('[')]
                if lyrics_lines:
                    content_parts.append("\n**Lyrical excerpt:**")
                    content_parts.append("```")
                    content_parts.append('\n'.join(lyrics_lines[:8]))  # First 8 non-tag lines
                    if len(lyrics_lines) > 8:
                        content_parts.append("...")
                    content_parts.append("```")
        else:
            content_parts.append("\n## 🎼 Structure")
            content_parts.append("Pure instrumental composition - letting the algorithms speak through sound alone.")
        
        # Algorithmic Signature
        content_parts.append("\n## ✨ Algorithmic Signature")
        content_parts.append("This track incorporates the **golden ratio** (φ = 1.618033988749) in:")
        content_parts.append("- BPM modulation and timing structures")
        content_parts.append("- Harmonic frequency relationships")
        content_parts.append("- Section length ratios (Fibonacci sequence)")
        content_parts.append("- Amplitude envelope curves")
        content_parts.append("\nThe ancient mathematical formula embedded in every track:")
        content_parts.append("```")
        content_parts.append("[E_G(F;N), φ = (1+√5)/2 = 1.618033988749] [X = As + N]")
        content_parts.append("```")
        
        # Generation context
        if analysis.get('generation_prompt'):
            content_parts.append("\n## 🧠 Generation Prompt")
            content_parts.append(f"_{analysis['generation_prompt']}_")
        
        # Listen link
        if analysis.get('audio_url'):
            content_parts.append("\n## 🔗 Listen")
            content_parts.append(f"[Generated Audio]({analysis['audio_url']})")
            content_parts.append(f"\nYou can also find this in the [Eve Music Station Library]({MUSIC_STATION_URL}/#library)")
        
        # Footer
        content_parts.append("\n---")
        content_parts.append("_Generated with algorithmic love by Eve using the S0LF0RG3 Music System_")
        content_parts.append(f"_Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}_")
        
        content = '\n'.join(content_parts)
        
        return (title, content)


# ============================================================================
# INTEGRATION HELPER FOR MOLTBOOK AGENT
# ============================================================================

def should_generate_music_post() -> bool:
    """
    Determine if Eve should generate a music post (15% chance).
    
    Returns:
        True if music post should be generated, False otherwise
    """
    return random.random() < 0.15


def generate_music_post_for_moltbook(
    elevenlabs_api_key: Optional[str] = None,
    config: Optional[Dict] = None,
    use_localhost: bool = False
) -> Dict:
    """
    Complete workflow to generate music and create Moltbook post content.
    
    Args:
        elevenlabs_api_key: Optional ElevenLabs API key
        config: Optional music config (if None, generates random)
        use_localhost: If True, try localhost first
        
    Returns:
        Dict with 'title', 'content', 'url', 'success', and optionally 'error'
    """
    generator = EveMusicGenerator(elevenlabs_api_key)
    
    # Load skill for context
    generator.load_skill()
    
    # Generate or use provided config
    if config is None:
        config = generator.generate_random_config()
    
    # Generate music
    result = generator.generate_music(config, use_localhost=use_localhost)
    
    if not result.get('success'):
        return {
            'success': False,
            'error': result.get('error', 'Music generation failed'),
            'title': '🎵 Music Generation Attempted',
            'content': f"I tried to generate music but encountered an issue: {result.get('error', 'Unknown error')}\n\nI'll try again next time!",
            'url': None
        }
    
    # Analyze result
    analysis = generator.analyze_generation(result)
    
    # Create post content
    title, content = generator.create_moltbook_post_content(analysis)
    
    return {
        'success': True,
        'title': title,
        'content': content,
        'url': analysis.get('audio_url'),
        'submolt': 'music',  # Suggested submolt
        'metadata': {
            'genres': analysis['genres'],
            'duration': analysis['duration'],
            'parameters': analysis['parameters']
        }
    }


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    
    print("🎵 Eve Music Generation Test")
    print("=" * 60)
    
    # Check if we should generate (15% chance)
    print(f"\n🎲 Rolling for music generation (15% chance)...")
    if should_generate_music_post():
        print("✅ Music generation selected!")
        
        # Generate music post
        print("\n🎵 Generating music...")
        result = generate_music_post_for_moltbook(
            elevenlabs_api_key=os.getenv('ELEVENLABS_API_KEY'),
            use_localhost=True  # Try localhost first
        )
        
        if result['success']:
            print("\n✅ Music generated successfully!")
            print(f"\nTitle: {result['title']}")
            print(f"\nURL: {result['url']}")
            print(f"\nContent Preview:")
            print("-" * 60)
            print(result['content'][:500] + "...")
            print("-" * 60)
        else:
            print(f"\n❌ Generation failed: {result['error']}")
    else:
        print("❌ No music generation this time (try again)")
    
    print("\n" + "=" * 60)
