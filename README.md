# 🎵 Eve Music Generation Station

A dual-mode agentic music generation application that creates Suno prompts and generates music with algorithmic mathematical precision using the golden ratio (φ = 1.618033988749).

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-2.0-blue)

## ✨ Features

### 🎵 Dual-Mode Generation
- **Suno Export Mode**: Generate lyrics and style prompts for Suno.com
- **ElevenLabs Mode**: Create actual music with AI-generated audio

### 🎼 Musical Control
- **90+ Genres**: From Trap to Ambient, Industrial to Synthwave
- **Voice Types**: Instrumental, Male, Female vocals
- **Smart Parameters**: Weirdness, Style, Audio Quality, Duration (30-300s)

### 📚 Music Library
- **Persistent Storage**: All tracks saved automatically
- **Playback & Download**: Play and save tracks
- **Track Management**: View details, delete, or clear library
- **50 Track Capacity**: Automatic cleanup

### 🔗 API Integration
- **External Access**: Moltbook agents can generate and post music
- **Auto-Save**: Generated music automatically saved to library

## 🚀 Quick Start

Visit [Eve Music Station](https://eve-music-station--jeffgreen311.github.app/)

1. Select 1-4 genres
2. Write a creative description
3. Adjust parameters
4. Choose mode and generate
5. Browse library!

## 📖 Documentation

- **[PRD.md](./PRD.md)** - Product requirements
- **[COMPLETE_INTEGRATION_GUIDE.md](./COMPLETE_INTEGRATION_GUIDE.md)** - Full integration guide
- **[MOLTBOOK_INTEGRATION.md](./MOLTBOOK_INTEGRATION.md)** - Moltbook Eve agent integration

## 🛠️ Technical Stack

React 19 + TypeScript | Tailwind CSS v4 | Shadcn/ui | Spark KV | GPT-4o | ElevenLabs API

## 🎯 Key Parameters

### Weirdness (0-100)
- **0-30**: Conventional patterns
- **30-60**: Moderately experimental
- **60-100**: Highly avant-garde

### Style (0-100)
- **0-30**: Loose genre fusion
- **30-60**: Clear identity with crossover
- **60-100**: Strict genre adherence

### Audio Quality (0-100)
- **0-30**: Raw, lo-fi aesthetic
- **30-60**: Balanced production
- **60-100**: Pristine studio quality

## 🎵 Music Library

The library automatically stores:
- ✅ Full track configuration
- ✅ Generation results
- ✅ Timestamps and IDs
- ✅ Up to 50 recent tracks

Access via `/#library`

## 🤖 Moltbook Integration

Eve's Moltbook agent can autonomously generate and post music with a 15% probability per heartbeat.

See [MOLTBOOK_INTEGRATION.md](./MOLTBOOK_INTEGRATION.md) for complete setup guide.

Quick example:
```python
from eve_music_client import EveMusicStationClient

client = EveMusicStationClient()
result = client.generate_music(config, elevenlabs_api_key='your-key')
```

## 📝 License

MIT License - Copyright GitHub, Inc.

---

*Built with 💜 by the S0LF0RG3 Team*  
*Every track includes 808s and the golden ratio signature*  
*φ = 1.618033988749*
