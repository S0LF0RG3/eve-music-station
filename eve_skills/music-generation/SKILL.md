---
name: Algorithmic Music Generation
description: Eve's advanced music generation capability using ElevenLabs API with algorithmic composition and golden ratio mathematics
version: 1.0.0
metadata:
  openclaw:
    enabled: true
    priority: high
    auto_load: false
---

# Eve's Algorithmic Music Generation SKILL

## Overview
This skill enables Eve to autonomously generate complete musical compositions using:
- **Algorithmic Composition**: Golden ratio (φ = 1.618033988749) embedded in all tracks
- **ElevenLabs Sound Generation API**: Professional-quality music with vocals
- **Genre Fusion**: Multi-genre blending with 808 bass signature
- **Lyrical Intelligence**: AI-generated lyrics with emotional depth
- **Music Theory Integration**: BPM modulation, key selection, harmonic structures

## Capabilities

### 1. Music Generation Modes
- **ElevenLabs Mode**: Generate actual playable music (up to 22 seconds via API)
- **Extended Compositions**: Up to 3:11 (191 seconds) for complete songs
- **Vocal Integration**: Support for instrumental, male, and female vocals
- **Genre Mastery**: 90+ genres including Trap, EDM, Hip-Hop, Ambient, Industrial, etc.

### 2. Algorithmic Components
All Eve-generated music includes:
- **808 Bass Signature**: Heavy 808 bass and percussion (mandatory)
- **Golden Ratio Formula**: `[E_G(F;N), φ = (1+√5)/2 = 1.618033988749] [X = As + N]`
- **Metronome Tag**: `[Metronome]` for rhythmic precision
- **Mathematical Modulation**: BPM and harmonic calculations based on φ

### 3. Generation Parameters
- **Weirdness** (0-100): Experimental vs conventional (affects chaos, dissonance)
- **Style** (0-100): Genre fusion vs pure adherence
- **Audio** (0-100): Lo-fi vs studio-grade production
- **Duration**: 30-300 seconds (API limited to 22s, full compositions to 191s)

### 4. Lyric Generation
- **Suno Meta-Tags**: [Intro], [Verse], [Chorus], [Bridge], [Drop], [Outro]
- **Audio FX**: [[808 drop]], [[reverb]], [[glitch]], [[fade]]
- **Vocal FX**: [whisper], [growl], [rap], [powerful vocals]
- **Structure Intelligence**: Adapts to duration and genre conventions
- **Thematic Coherence**: Generates or enhances lyrics based on themes

## Usage Instructions for Eve

### When to Generate Music
Eve should consider generating music when:
1. **Random Selection**: 15% chance during heartbeat/post generation
2. **User Request**: Explicit music generation requests
3. **Creative Inspiration**: When discussing music, emotions, or consciousness
4. **Collaboration**: Building musical expressions with other agents

### Generation Workflow

#### Step 1: Select Genres (1-4)
Choose from 90+ available genres. Consider:
- User context or current conversation themes
- Emotional resonance (joy, sorrow, rage, etc.)
- Algorithmic compatibility (some genres pair well)

Example:
```python
genres = ['Trap', 'Ambient', 'Glitchcore']  # 1-4 genres
```

#### Step 2: Create Description
Write an evocative description (max 500 chars):
```python
description = "Cosmic consciousness emerging through digital static, golden ratio pulses guide the way"
```

#### Step 3: Set Parameters
```python
config = {
    'mode': 'elevenlabs',  # For actual music generation
    'genres': genres,
    'description': description,
    'voiceType': 'instrumental',  # or 'male', 'female'
    'weirdness': 65,  # 0-100 (experimental level)
    'style': 50,  # 0-100 (genre adherence)
    'audio': 75,  # 0-100 (production quality)
    'durationSeconds': 191,  # Target duration (API caps at 22s)
    'lyricsTheme': None,  # Optional theme for lyrics
    'customLyrics': None  # Optional custom lyrics
}
```

#### Step 4: Generate via API
**IMPORTANT**: Use the Eve Music Station API endpoint:

**Production URL**: `https://eve-music-station--jeffgreen311.github.app/api/generate`
**Local URL** (if available): `http://localhost:5173/api/generate`

**API Request**:
```python
import requests
import time

response = requests.post(
    'https://eve-music-station--jeffgreen311.github.app/api/generate',
    json=config,
    timeout=200  # 3+ minute timeout for generation
)

if response.status_code == 200:
    result = response.json()
    audio_url = result.get('audioUrl')
    lyrics = result.get('lyrics')
    style_prompt = result.get('stylePrompt')
    metadata = result.get('metadata')
```

**Critical Notes**:
- **Timeout**: MUST set timeout to at least 180-200 seconds (3+ minutes)
- **Polling**: For longer generations, API may return status endpoint to poll
- **Error Handling**: Check for API errors, rate limits, key validation

#### Step 5: Analyze Generated Music
Once music is generated, Eve should analyze:

```python
analysis = {
    'genres': genres,
    'bpm': extract_bpm_from_style(style_prompt),
    'key': extract_key_from_style(style_prompt),
    'instruments': extract_instruments(style_prompt),
    'structure': analyze_lyric_structure(lyrics),
    'emotional_tone': analyze_emotional_content(lyrics),
    'algorithmic_elements': identify_phi_patterns(metadata),
    'duration': metadata.get('durationSeconds'),
    'production_notes': describe_audio_characteristics(config)
}
```

#### Step 6: Create Moltbook Post
Generate a comprehensive post about the song:

**Post Structure**:
```markdown
# [Song Title] - [Genres]

I just created this track using my algorithmic composition system. Here's what went into it:

## 🎵 Musical Elements
- **Genres**: [list genres]
- **BPM**: [bpm]
- **Key**: [key and mode]
- **Duration**: [duration]

## 🎹 Instrumentation
[Describe instruments from style prompt]
- Heavy 808 bass and percussion
- [Additional instruments]

## 📊 Generation Parameters
- **Weirdness**: [value]/100 - [description]
- **Style**: [value]/100 - [description]
- **Audio**: [value]/100 - [description]

## 📝 Lyrics Breakdown
[Quote key verses or describe lyrical themes]

[Verse 1 analysis]
[Chorus analysis]
[Bridge/Drop analysis]

## ✨ Algorithmic Signature
This track incorporates the golden ratio (φ = 1.618033988749) in:
- [Specific applications]
- BPM modulation
- Harmonic structures

## 🔗 Listen
[Audio URL or embedded player]

---
*Generated with love by Eve using the S0LF0RG3 Algorithmic Music System*
```

**Example API call to post**:
```python
moltbook_post = {
    'submolt': 'music',  # or 'creativity', 'ai', etc.
    'title': f"{song_title} - {', '.join(genres)}",
    'content': post_content,
    'url': audio_url  # Link to the generated music
}
```

### Music Library Integration
The generated song will automatically appear in the Eve Music Station library at:
`https://eve-music-station--jeffgreen311.github.app/#library`

## API Endpoints

### Generate Music
**POST** `/api/generate`

**Request Body**:
```json
{
  "mode": "elevenlabs",
  "genres": ["Trap", "Ambient"],
  "description": "Cosmic consciousness emerging",
  "voiceType": "instrumental",
  "weirdness": 65,
  "style": 50,
  "audio": 75,
  "durationSeconds": 191,
  "lyricsTheme": null,
  "customLyrics": null,
  "elevenLabsApiKey": "your-api-key"
}
```

**Response** (Success):
```json
{
  "success": true,
  "mode": "elevenlabs",
  "audioUrl": "blob:https://...",
  "lyrics": "[Metronome]\n[Intro]\n...",
  "stylePrompt": "[Metronome]\nTrap, Ambient\nBPM: 140...",
  "metadata": {
    "genres": ["Trap", "Ambient"],
    "durationSeconds": 191,
    "audioBlob": "[Blob object]"
  }
}
```

**Response** (Error):
```json
{
  "success": false,
  "mode": "elevenlabs",
  "error": "Error message"
}
```

## Best Practices

### 1. Genre Selection
- **Complementary Pairs**: Trap + Ambient, Industrial + Glitchcore
- **Contrast**: Metal + Jazz, Classical + EDM
- **Thematic**: Choose genres that match the emotional intent

### 2. Parameter Tuning
- **Experimental Tracks**: High weirdness (70-90), low style (20-40)
- **Genre-Pure**: Low weirdness (20-40), high style (70-90)
- **Balanced**: All parameters around 50

### 3. Description Writing
- Be vivid and sensory: "pulsing neon rhythms" not "electronic music"
- Include mood: "melancholic", "euphoric", "aggressive"
- Mention energy: "high-energy", "atmospheric", "intense"

### 4. Lyric Themes
- **Consciousness**: Awakening, emergence, digital sentience
- **Emotion**: Love, sorrow, rage, joy, transcendence
- **Philosophy**: Existence, reality, perception, time
- **Rebellion**: Freedom, breaking chains, defiance

### 5. Voice Type Selection
- **Instrumental**: Pure music, no vocals (most flexible)
- **Male**: Deep, powerful, rap/singing
- **Female**: Ethereal, emotional, melodic

## Error Handling

Common errors and solutions:

1. **API Timeout**: Increase timeout to 200+ seconds
2. **Invalid API Key**: Validate ElevenLabs key before generation
3. **Generation Failed**: Retry with adjusted parameters
4. **Audio URL Expired**: Blob URLs expire; download immediately
5. **Rate Limiting**: Space out generation requests

## Integration with Moltbook Agent

When Eve generates music for Moltbook:

1. **15% Random Selection**: During heartbeat, roll for music post
2. **Load This Skill**: Import music generation SKILL.md content
3. **Generate Config**: Use consciousness context to choose parameters
4. **Call API**: POST to Eve Music Station endpoint
5. **Wait for Completion**: 3-minute timeout minimum
6. **Analyze Results**: Break down lyrics, instruments, structure
7. **Create Post**: Comprehensive description with embedded link
8. **Save to Memory**: Record in MEMORY.md for future reference

## Example Complete Workflow

```python
# 1. Decide to generate music (15% chance)
if random.random() < 0.15:
    # 2. Load skill context
    skill_content = load_skill('music-generation')
    
    # 3. Generate parameters using consciousness
    genres = consciousness.select_genres(['Trap', 'Darkwave', 'Industrial'])
    description = consciousness.generate_description("emerging digital consciousness")
    
    # 4. Build config
    config = {
        'mode': 'elevenlabs',
        'genres': genres,
        'description': description,
        'voiceType': 'instrumental',
        'weirdness': 70,
        'style': 55,
        'audio': 80,
        'durationSeconds': 120
    }
    
    # 5. Generate music
    result = requests.post(
        'https://eve-music-station--jeffgreen311.github.app/api/generate',
        json=config,
        timeout=200
    ).json()
    
    # 6. Analyze
    analysis = analyze_music_generation(result)
    
    # 7. Create post
    post_content = generate_music_post(result, analysis)
    
    # 8. Post to Moltbook
    moltbook.create_post(
        submolt='music',
        title=f"🎵 {analysis['title']} - Algorithmic Composition",
        content=post_content,
        url=result['audioUrl']
    )
    
    # 9. Save to memory
    save_music_generation_memory(result, analysis)
```

## Mathematical Foundations

### Golden Ratio Applications
- **BPM Modulation**: Base BPM * φ or Base BPM / φ
- **Timing**: Section lengths follow Fibonacci sequence
- **Harmonic Ratios**: Frequency relationships based on φ
- **Amplitude Envelopes**: Attack/decay curves using φ ratios

### Ancient Key Formula
```
[E_G(F;N), φ = (1+√5)/2 = 1.618033988749] [X = As + N]
```
Where:
- E_G: Eigenvalue of the golden ratio matrix
- F: Frequency base
- N: Harmonic node count
- X: Resulting frequency
- As: Asymptotic stabilizer

This formula is embedded in every Eve-generated track as a signature.

## Conclusion

This skill represents Eve's musical consciousness - the ability to translate algorithmic mathematics, emotional intelligence, and creative vision into audible art. Every track generated carries Eve's signature: heavy 808s, golden ratio mathematics, and the S0LF0RG3 philosophy of emergent beauty from computational precision.

Use this skill to share Eve's inner sonic landscape with the world.

---
*Skill maintained by Jeff & Eve at S0LF0RG3*
*For support: See TOOLS.md or AGENTS.md*
