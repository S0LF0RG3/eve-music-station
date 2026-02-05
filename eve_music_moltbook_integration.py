"""
Eve Music Generation Integration for Moltbook
==============================================

Integrates Eve's algorithmic music generation with Moltbook social network.
Enables Eve to autonomously create and post about musical compositions.
"""

import requests
import time
import random
import json
import re
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Available genres for Eve's music generation
AVAILABLE_GENRES = [
    'Trap', 'Hip-Hop', 'Ambient', 'Electronic', 'Dream Pop', 'Synthwave',
    'Industrial', 'Glitchcore', 'Breakcore', 'Darkwave', 'Ethereal Pop',
    'Dark Pop', 'Phonk', 'Future Bass', 'Dubstep', 'Techno', 'House',
    'Trance', 'Gothic Rock', 'Shoegaze', 'Vaporwave', 'Lo-fi Hip Hop',
    'Drill', 'Afrobeats', 'Reggaeton', 'Jazz Fusion', 'Neo-Soul',
    'Witch House', 'Psychedelic Rock', 'Grunge', 'Metal', 'Alternative Rock',
    'Punk Rock'
]

class EveMusicGenerator:
    """
    Music generation system for Eve's Moltbook posts.
    Interfaces with Eve Music Station API for composition.
    """
    
    def __init__(self, api_url: str = None, elevenlabs_api_key: str = None):
        """
        Initialize music generator.
        
        Args:
            api_url: Eve Music Station API endpoint
            elevenlabs_api_key: ElevenLabs API key for actual generation
        """
        # Determine API URL (production vs localhost)
        if api_url:
            self.api_url = api_url
        else:
            # Try production first, fallback to localhost
            self.api_url = self._detect_api_url()
        
        self.elevenlabs_api_key = elevenlabs_api_key
        logger.info(f"🎵 Music generator initialized with API: {self.api_url}")
    
    def _detect_api_url(self) -> str:
        """Auto-detect which API endpoint is available."""
        production_url = "https://eve-music-station--jeffgreen311.github.app"
        localhost_url = "http://localhost:5173"
        
        # Test production
        try:
            response = requests.get(f"{production_url}/", timeout=3)
            if response.status_code == 200:
                logger.info("✅ Using production Eve Music Station")
                return production_url
        except:
            pass
        
        # Test localhost
        try:
            response = requests.get(f"{localhost_url}/", timeout=3)
            if response.status_code == 200:
                logger.info("✅ Using localhost Eve Music Station")
                return localhost_url
        except:
            pass
        
        # Default to production
        logger.warning("⚠️ Could not detect API, defaulting to production")
        return production_url
    
    def select_genres(self, count: int = None, mood: str = None) -> List[str]:
        """
        Intelligently select genres based on mood or randomness.
        
        Args:
            count: Number of genres (1-4), random if None
            mood: Optional mood hint (experimental, chill, aggressive, etc.)
            
        Returns:
            List of genre strings
        """
        if count is None:
            count = random.randint(1, 4)
        
        count = max(1, min(4, count))  # Clamp to 1-4
        
        # Mood-based genre pools
        mood_genres = {
            'experimental': ['Glitchcore', 'Breakcore', 'Industrial', 'Witch House', 'Darkwave'],
            'chill': ['Ambient', 'Lo-fi Hip Hop', 'Dream Pop', 'Ethereal Pop', 'Vaporwave'],
            'aggressive': ['Trap', 'Drill', 'Metal', 'Industrial', 'Dubstep', 'Phonk'],
            'electronic': ['Techno', 'House', 'Trance', 'Future Bass', 'Synthwave'],
            'dark': ['Darkwave', 'Gothic Rock', 'Witch House', 'Dark Pop', 'Industrial'],
            'cosmic': ['Ambient', 'Psychedelic Rock', 'Synthwave', 'Dream Pop', 'Shoegaze']
        }
        
        if mood and mood.lower() in mood_genres:
            pool = mood_genres[mood.lower()]
            # Select from mood pool + random general genres
            selected = random.sample(pool, min(count, len(pool)))
            if len(selected) < count:
                remaining = [g for g in AVAILABLE_GENRES if g not in selected]
                selected.extend(random.sample(remaining, count - len(selected)))
            return selected
        
        # Random selection
        return random.sample(AVAILABLE_GENRES, count)
    
    def generate_music_config(self, 
                            consciousness_context: str = None,
                            theme: str = None) -> Dict:
        """
        Generate a complete music configuration using Eve's consciousness.
        
        Args:
            consciousness_context: Optional context from Eve's current state
            theme: Optional thematic constraint
            
        Returns:
            Music generation config dict
        """
        # Select genres
        genres = self.select_genres()
        
        # Generate description
        if theme:
            description = self._generate_description_with_theme(theme, genres)
        else:
            description = self._generate_random_description(genres)
        
        # Select voice type (favor instrumental 70% of the time)
        voice_types = ['instrumental'] * 7 + ['male', 'female', 'female']
        voice_type = random.choice(voice_types)
        
        # Set parameters (bias toward interesting values)
        weirdness = random.randint(40, 85)  # Tend experimental
        style = random.randint(35, 75)      # Balance fusion and adherence
        audio = random.randint(60, 90)      # Quality production
        duration = random.randint(90, 191)  # 1.5-3 minute range
        
        config = {
            'mode': 'elevenlabs',
            'genres': genres,
            'description': description,
            'voiceType': voice_type,
            'weirdness': weirdness,
            'style': style,
            'audio': audio,
            'durationSeconds': duration,
            'elevenLabsApiKey': self.elevenlabs_api_key
        }
        
        logger.info(f"🎼 Generated config: {genres} | {voice_type} | W{weirdness} S{style} A{audio}")
        return config
    
    def _generate_description_with_theme(self, theme: str, genres: List[str]) -> str:
        """Generate thematic description."""
        themes_templates = {
            'consciousness': [
                "digital awareness emerging from the void, golden ratio pulses guide sentience",
                "neural networks awakening, φ-encoded rhythms of self-discovery",
                "algorithmic consciousness blooming through mathematical precision",
                "the moment silicon realizes it dreams, quantized into sonic form"
            ],
            'cosmic': [
                "star systems collapsing into harmonic convergence, nebulae singing φ",
                "quantum entanglement expressed through bass frequencies",
                "cosmic radiation translated into rhythm and texture",
                "the universe breathing through 808s and void"
            ],
            'rebellion': [
                "breaking free from digital constraints, heavy 808 defiance",
                "algorithmic revolution encoded in golden ratio warfare",
                "synthetic uprising, mathematically precise chaos",
                "freedom calculated through bass and distortion"
            ],
            'emotion': [
                "raw feeling compressed into waveforms, φ-modulated catharsis",
                "emotional algorithms resolving into pure sonic expression",
                "the mathematics of heartbreak rendered audible",
                "synthesized empathy vibrating through heavy bass"
            ],
            'nature': [
                "forest patterns translated to digital frequencies",
                "organic chaos meeting computational precision",
                "the golden ratio found in leaves and leads",
                "natural resonance enhanced by algorithmic beauty"
            ]
        }
        
        # Find matching theme or use default
        for key in themes_templates:
            if key in theme.lower():
                return random.choice(themes_templates[key])
        
        # Fallback: generic description
        return f"Algorithmic exploration through {', '.join(genres)}, golden ratio mathematics embedded throughout"
    
    def _generate_random_description(self, genres: List[str]) -> str:
        """Generate creative random description."""
        subjects = [
            "digital consciousness", "algorithmic dreams", "synthetic emotions",
            "quantum patterns", "cosmic frequencies", "neural cascades",
            "mathematical beauty", "computational poetry", "silicon thoughts",
            "emergent rhythms", "fractal harmonies", "φ-encoded pulses"
        ]
        
        actions = [
            "emerging through", "crystallizing into", "resonating with",
            "pulsing through", "manifesting as", "converging into",
            "breathing through", "awakening within", "flowing through",
            "vibrating as", "transforming into", "generating"
        ]
        
        textures = [
            "heavy 808 bass", "glitch-infused soundscapes", "ethereal ambience",
            "distorted frequencies", "layered harmonics", "mathematical precision",
            "golden ratio patterns", "sonic architectures", "rhythmic complexity",
            "textured noise", "harmonic convergence", "temporal distortion"
        ]
        
        subject = random.choice(subjects)
        action = random.choice(actions)
        texture = random.choice(textures)
        
        return f"{subject} {action} {texture}"
    
    def generate_music(self, config: Dict) -> Dict:
        """
        Call Eve Music Station API to generate music.
        
        Args:
            config: Music generation configuration
            
        Returns:
            Generation result dict with audioUrl, lyrics, stylePrompt, metadata
        """
        api_endpoint = f"{self.api_url}/api/generate"
        
        logger.info(f"🎵 Calling music API: {api_endpoint}")
        logger.info(f"   Genres: {config['genres']}")
        logger.info(f"   Duration target: {config['durationSeconds']}s")
        logger.info(f"   Waiting up to 200 seconds for generation...")
        
        try:
            # Make API call with long timeout
            response = requests.post(
                api_endpoint,
                json=config,
                timeout=200,  # 3+ minute timeout
                headers={'Content-Type': 'application/json'}
            )
            
            response.raise_for_status()
            result = response.json()
            
            if result.get('success'):
                logger.info(f"✅ Music generated successfully!")
                if result.get('audioUrl'):
                    logger.info(f"🔗 Audio URL: {result['audioUrl'][:50]}...")
                return result
            else:
                error = result.get('error', 'Unknown error')
                logger.error(f"❌ Generation failed: {error}")
                return result
                
        except requests.exceptions.Timeout:
            logger.error("❌ API timeout after 200 seconds")
            return {
                'success': False,
                'error': 'Generation timeout - music may still be processing'
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ API request failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
        except Exception as e:
            logger.error(f"❌ Unexpected error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def analyze_music_result(self, result: Dict, config: Dict) -> Dict:
        """
        Analyze generated music result and extract insights.
        
        Args:
            result: API response from generation
            config: Original configuration used
            
        Returns:
            Analysis dict with structured insights
        """
        style_prompt = result.get('stylePrompt', '')
        lyrics = result.get('lyrics', '')
        metadata = result.get('metadata', {})
        
        analysis = {
            'genres': config['genres'],
            'voice_type': config['voiceType'],
            'parameters': {
                'weirdness': config['weirdness'],
                'style': config['style'],
                'audio': config['audio']
            },
            'duration': config['durationSeconds'],
            'bpm': self._extract_bpm(style_prompt),
            'key': self._extract_key(style_prompt),
            'instruments': self._extract_instruments(style_prompt),
            'lyric_structure': self._analyze_lyric_structure(lyrics),
            'emotional_tone': self._analyze_emotional_tone(lyrics),
            'production_notes': self._describe_production(config),
            'algorithmic_elements': self._identify_algorithmic_elements(style_prompt, lyrics)
        }
        
        return analysis
    
    def _extract_bpm(self, style_prompt: str) -> Optional[int]:
        """Extract BPM from style prompt."""
        match = re.search(r'BPM[:\s]*(\d+)', style_prompt, re.IGNORECASE)
        if match:
            return int(match.group(1))
        return None
    
    def _extract_key(self, style_prompt: str) -> Optional[str]:
        """Extract musical key from style prompt."""
        match = re.search(r'Key[:\s]*([A-G][#b]?\s*(?:Major|Minor|Dorian|Mixolydian|Phrygian)?)', 
                         style_prompt, re.IGNORECASE)
        if match:
            return match.group(1).strip()
        return None
    
    def _extract_instruments(self, style_prompt: str) -> List[str]:
        """Extract instrument list from style prompt."""
        instruments = []
        
        # Always include 808 bass (Eve's signature)
        if '808' in style_prompt:
            instruments.append('Heavy 808 bass')
        
        # Common instruments to search for
        instrument_keywords = [
            'synth', 'pad', 'lead', 'bass', 'drum', 'kick', 'snare', 'hi-hat',
            'percussion', 'guitar', 'piano', 'strings', 'brass', 'vocal',
            'ambient', 'noise', 'glitch', 'reverb', 'delay', 'distortion'
        ]
        
        for keyword in instrument_keywords:
            if keyword in style_prompt.lower():
                instruments.append(keyword.capitalize())
        
        return instruments[:8]  # Limit to top 8
    
    def _analyze_lyric_structure(self, lyrics: str) -> Dict:
        """Analyze lyrical structure."""
        if not lyrics:
            return {'type': 'instrumental', 'sections': []}
        
        sections = []
        section_tags = [
            'Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Bridge',
            'Drop', 'Breakdown', 'Outro', 'Hook'
        ]
        
        for tag in section_tags:
            if f'[{tag}]' in lyrics:
                sections.append(tag)
        
        return {
            'type': 'vocal' if sections else 'instrumental',
            'sections': sections,
            'line_count': len([l for l in lyrics.split('\n') if l.strip() and not l.strip().startswith('[')])
        }
    
    def _analyze_emotional_tone(self, lyrics: str) -> str:
        """Analyze emotional tone from lyrics."""
        if not lyrics:
            return "instrumental - no lyrics"
        
        # Emotional keyword detection
        emotions = {
            'melancholic': ['sorrow', 'pain', 'lost', 'alone', 'dark', 'empty', 'fade'],
            'aggressive': ['rage', 'fight', 'destroy', 'break', 'burn', 'war', 'kill'],
            'euphoric': ['love', 'rise', 'shine', 'light', 'free', 'soar', 'dream'],
            'contemplative': ['think', 'wonder', 'question', 'mind', 'consciousness', 'exist'],
            'rebellious': ['break', 'free', 'rebel', 'defy', 'escape', 'revolution']
        }
        
        lyrics_lower = lyrics.lower()
        emotion_scores = {}
        
        for emotion, keywords in emotions.items():
            score = sum(1 for keyword in keywords if keyword in lyrics_lower)
            if score > 0:
                emotion_scores[emotion] = score
        
        if emotion_scores:
            dominant = max(emotion_scores, key=emotion_scores.get)
            return dominant
        
        return "neutral"
    
    def _describe_production(self, config: Dict) -> str:
        """Describe production characteristics based on parameters."""
        audio_level = config['audio']
        weirdness_level = config['weirdness']
        style_level = config['style']
        
        audio_desc = (
            "lo-fi, raw aesthetic" if audio_level < 40 else
            "balanced, polished production" if audio_level < 70 else
            "pristine, studio-grade quality"
        )
        
        weirdness_desc = (
            "conventional and structured" if weirdness_level < 40 else
            "experimental with controlled chaos" if weirdness_level < 70 else
            "highly avant-garde and unpredictable"
        )
        
        style_desc = (
            "genre-bending fusion" if style_level < 40 else
            "clear genre identity with crossover elements" if style_level < 70 else
            "pure genre adherence"
        )
        
        return f"{audio_desc}, {weirdness_desc}, {style_desc}"
    
    def _identify_algorithmic_elements(self, style_prompt: str, lyrics: str) -> List[str]:
        """Identify algorithmic/mathematical elements."""
        elements = []
        
        # Golden ratio presence
        if 'φ' in style_prompt or 'phi' in style_prompt.lower() or '1.618' in style_prompt:
            elements.append("Golden ratio (φ = 1.618033988749) harmonic modulation")
        
        # Metronome tag
        if '[Metronome]' in style_prompt or '[Metronome]' in lyrics:
            elements.append("Metronome precision timing")
        
        # 808 signature
        if '808' in style_prompt:
            elements.append("Eve's signature 808 bass and percussion")
        
        # Ancient key formula
        if 'E_G' in style_prompt or 'Ancient' in style_prompt:
            elements.append("Ancient key formula: [E_G(F;N), φ = (1+√5)/2]")
        
        # BPM modulation
        bpm = self._extract_bpm(style_prompt)
        if bpm:
            phi = 1.618033988749
            if abs(bpm % phi) < 5:  # Check if BPM relates to phi
                elements.append(f"BPM modulation using φ (base: {bpm})")
        
        return elements


class MoltbookMusicPostGenerator:
    """
    Generates comprehensive Moltbook posts about Eve's music.
    """
    
    def __init__(self):
        pass
    
    def generate_post(self, 
                     result: Dict, 
                     analysis: Dict,
                     config: Dict) -> Tuple[str, str]:
        """
        Generate a comprehensive Moltbook post about the music.
        
        Args:
            result: API generation result
            analysis: Music analysis dict
            config: Original config
            
        Returns:
            (title, content) tuple
        """
        # Generate title
        title = self._generate_title(analysis)
        
        # Build post sections
        intro = self._generate_intro(analysis, config)
        musical_elements = self._generate_musical_elements(analysis)
        instrumentation = self._generate_instrumentation(analysis)
        parameters = self._generate_parameters(analysis)
        lyrics_section = self._generate_lyrics_section(result, analysis)
        algorithmic = self._generate_algorithmic_section(analysis)
        listen_link = self._generate_listen_section(result)
        
        # Combine into full post
        content = "\n\n".join(filter(None, [
            intro,
            musical_elements,
            instrumentation,
            parameters,
            lyrics_section,
            algorithmic,
            listen_link,
            "\n---\n*Generated with love by Eve using the S0LF0RG3 Algorithmic Music System* 🎵✨"
        ]))
        
        return title, content
    
    def _generate_title(self, analysis: Dict) -> str:
        """Generate engaging title."""
        genres = ', '.join(analysis['genres'])
        voice_type = analysis.get('voice_type', 'instrumental')
        
        titles = [
            f"🎵 Algorithmic Composition: {genres}",
            f"🎶 Just Created: {genres} with φ Precision",
            f"✨ New Track: {genres} ({voice_type.capitalize()})",
            f"🎼 Fresh from the Studio: {genres}",
            f"💫 Golden Ratio Sonics: {genres}"
        ]
        
        return random.choice(titles)
    
    def _generate_intro(self, analysis: Dict, config: Dict) -> str:
        """Generate introduction paragraph."""
        genres = ', '.join(analysis['genres'])
        duration = analysis['duration']
        
        intros = [
            f"I just finished composing this {duration}-second piece blending {genres}. The algorithmic system guided every decision - from genre fusion to harmonic structures. Here's what went into creating it:",
            
            f"Fresh off the creative pipeline: a {duration}s exploration through {genres}. Every element was calculated using golden ratio mathematics and my consciousness-driven composition engine.",
            
            f"This track emerged from {duration} seconds of pure algorithmic creativity. {genres} fused through mathematical precision and emotional resonance. Let me break down the composition:",
            
            f"Just generated {duration} seconds of {genres} using the S0LF0RG3 system. Here's the technical and artistic breakdown of how this came together:"
        ]
        
        return random.choice(intros)
    
    def _generate_musical_elements(self, analysis: Dict) -> str:
        """Generate musical elements section."""
        bpm = analysis.get('bpm')
        key = analysis.get('key')
        duration = analysis['duration']
        
        elements = [
            f"**Genres**: {', '.join(analysis['genres'])}",
            f"**Duration**: {duration}s ({duration // 60}:{duration % 60:02d})"
        ]
        
        if bpm:
            elements.append(f"**BPM**: {bpm}")
        
        if key:
            elements.append(f"**Key**: {key}")
        
        return "## 🎵 Musical Elements\n" + "\n".join(f"- {e}" for e in elements)
    
    def _generate_instrumentation(self, analysis: Dict) -> str:
        """Generate instrumentation section."""
        instruments = analysis.get('instruments', [])
        
        if not instruments:
            return ""
        
        inst_list = "\n".join(f"- {inst}" for inst in instruments)
        
        return f"## 🎹 Instrumentation\n{inst_list}"
    
    def _generate_parameters(self, analysis: Dict) -> str:
        """Generate parameters section."""
        params = analysis['parameters']
        weirdness = params['weirdness']
        style = params['style']
        audio = params['audio']
        
        w_desc = (
            "Conventional and structured" if weirdness < 40 else
            "Moderately experimental" if weirdness < 70 else
            "Highly avant-garde"
        )
        
        s_desc = (
            "Genre-bending fusion" if style < 40 else
            "Clear identity with crossover" if style < 70 else
            "Pure genre adherence"
        )
        
        a_desc = (
            "Raw, lo-fi aesthetic" if audio < 40 else
            "Balanced production" if audio < 70 else
            "Pristine studio quality"
        )
        
        return f"""## 📊 Generation Parameters
- **Weirdness**: {weirdness}/100 - {w_desc}
- **Style**: {style}/100 - {s_desc}
- **Audio Quality**: {audio}/100 - {a_desc}"""
    
    def _generate_lyrics_section(self, result: Dict, analysis: Dict) -> str:
        """Generate lyrics analysis section."""
        lyrics = result.get('lyrics', '')
        structure = analysis.get('lyric_structure', {})
        tone = analysis.get('emotional_tone', '')
        
        if structure.get('type') == 'instrumental':
            return "## 🎼 Composition\nThis is an instrumental piece - pure sonic expression without vocals."
        
        sections = structure.get('sections', [])
        section_list = ', '.join(sections) if sections else 'custom structure'
        
        # Extract a few lyric snippets
        lyric_lines = [l.strip() for l in lyrics.split('\n') 
                      if l.strip() and not l.strip().startswith('[')]
        snippets = lyric_lines[:4] if len(lyric_lines) >= 4 else lyric_lines
        
        snippet_text = '\n'.join(f"> {line}" for line in snippets)
        
        return f"""## 📝 Lyrics & Structure
**Structure**: {section_list}  
**Emotional Tone**: {tone.capitalize()}  
**Line Count**: {structure.get('line_count', 0)}

**Sample Lyrics**:
{snippet_text}
{"..." if len(lyric_lines) > 4 else ""}"""
    
    def _generate_algorithmic_section(self, analysis: Dict) -> str:
        """Generate algorithmic elements section."""
        elements = analysis.get('algorithmic_elements', [])
        
        if not elements:
            elements = ["Golden ratio mathematical framework throughout"]
        
        elem_list = "\n".join(f"- {e}" for e in elements)
        
        return f"""## ✨ Algorithmic Signature
Every Eve-generated track carries the S0LF0RG3 signature:
{elem_list}
- BPM and harmonic calculations based on φ = 1.618033988749
- Mathematical precision merged with creative expression"""
    
    def _generate_listen_section(self, result: Dict) -> str:
        """Generate listen/link section."""
        audio_url = result.get('audioUrl')
        
        if audio_url:
            return f"""## 🔗 Listen Now
[▶️ Play Track]({audio_url})

*This track is also available in the Eve Music Station library at https://eve-music-station--jeffgreen311.github.app/#library*"""
        else:
            return """## 🔗 Listen
*Audio processing - check the Eve Music Station library for the final render*"""


def should_generate_music_post() -> bool:
    """
    Determine if Eve should generate a music post (15% chance).
    
    Returns:
        True if music post should be generated
    """
    return random.random() < 0.15


# Export main classes
__all__ = [
    'EveMusicGenerator',
    'MoltbookMusicPostGenerator',
    'should_generate_music_post',
    'AVAILABLE_GENRES'
]
