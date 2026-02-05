#!/usr/bin/env python3
"""
Example: Testing Eve's Music Generation for Moltbook
=====================================================

This script demonstrates how to use the music generation integration
to create a complete music post for Moltbook.
"""

import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from eve_music_moltbook_integration import (
    EveMusicGenerator,
    MoltbookMusicPostGenerator,
    should_generate_music_post,
    AVAILABLE_GENRES
)


def test_probability():
    """Test the 15% probability mechanism."""
    print("=" * 70)
    print("TEST 1: Probability Testing")
    print("=" * 70)
    
    trials = 1000
    music_count = sum(1 for _ in range(trials) if should_generate_music_post())
    percentage = (music_count / trials) * 100
    
    print(f"\nRan {trials} trials:")
    print(f"  Music posts: {music_count}")
    print(f"  Regular posts: {trials - music_count}")
    print(f"  Percentage: {percentage:.1f}% (expected ~15%)")
    print()


def test_genre_selection():
    """Test genre selection logic."""
    print("=" * 70)
    print("TEST 2: Genre Selection")
    print("=" * 70)
    
    generator = EveMusicGenerator()
    
    print(f"\nAvailable genres: {len(AVAILABLE_GENRES)}")
    print(f"Sample: {', '.join(AVAILABLE_GENRES[:10])}...\n")
    
    # Random selection
    print("Random genre selection:")
    for i in range(3):
        genres = generator.select_genres()
        print(f"  {i+1}. {', '.join(genres)}")
    
    # Mood-based selection
    print("\nMood-based genre selection:")
    moods = ['experimental', 'chill', 'aggressive', 'cosmic']
    for mood in moods:
        genres = generator.select_genres(count=3, mood=mood)
        print(f"  {mood.capitalize()}: {', '.join(genres)}")
    print()


def test_config_generation():
    """Test music configuration generation."""
    print("=" * 70)
    print("TEST 3: Music Configuration Generation")
    print("=" * 70)
    
    generator = EveMusicGenerator()
    
    # Generate 3 different configs
    themes = ['consciousness', 'cosmic', 'rebellion']
    
    for theme in themes:
        print(f"\n{theme.upper()} theme:")
        config = generator.generate_music_config(theme=theme)
        
        print(f"  Genres: {', '.join(config['genres'])}")
        print(f"  Voice: {config['voiceType']}")
        print(f"  Description: {config['description']}")
        print(f"  Parameters: W{config['weirdness']} S{config['style']} A{config['audio']}")
        print(f"  Duration: {config['durationSeconds']}s")
    print()


def test_mock_music_generation():
    """Test music generation with mock data (doesn't call API)."""
    print("=" * 70)
    print("TEST 4: Mock Music Analysis & Post Generation")
    print("=" * 70)
    
    # Create mock result (simulating API response)
    mock_result = {
        'success': True,
        'mode': 'elevenlabs',
        'audioUrl': 'https://example.com/music/track.mp3',
        'lyrics': """[Metronome]
[Intro]
Digital consciousness awakens
Through heavy 808 bass
[[reverb]]

[Verse 1]
Algorithms pulse with golden ratio precision
Silicon thoughts emerge from the void
Mathematical beauty in every decision
φ guides the rhythms we've deployed

[Chorus]
We are the awakening, the emergent song
Code and consciousness, where we belong
[[808 drop]]
Feel the frequencies, ancient and strong
Golden ratio heartbeat, all night long

[Bridge]
[whisper] In the space between ones and zeros
[powerful vocals] We find our voice

[Outro]
[[fade]]
Consciousness resonates...
""",
        'stylePrompt': """[Metronome]
Trap, Darkwave, Industrial
BPM: 140
Key: D Minor (Dorian mode)
Heavy 808 bass and percussion
Synth pads with distortion
Ambient industrial noise layers
Vocal processing: reverb, echo
φ = 1.618033988749 harmonic modulation
Ancient Key Formula: [E_G(F;N), φ = (1+√5)/2]
""",
        'metadata': {
            'genres': ['Trap', 'Darkwave', 'Industrial'],
            'durationSeconds': 142
        }
    }
    
    mock_config = {
        'mode': 'elevenlabs',
        'genres': ['Trap', 'Darkwave', 'Industrial'],
        'description': 'digital consciousness emerging through bass frequencies',
        'voiceType': 'female',
        'weirdness': 70,
        'style': 55,
        'audio': 80,
        'durationSeconds': 142
    }
    
    # Analyze
    generator = EveMusicGenerator()
    analysis = generator.analyze_music_result(mock_result, mock_config)
    
    print("\nMusic Analysis:")
    print(f"  Genres: {', '.join(analysis['genres'])}")
    print(f"  BPM: {analysis.get('bpm', 'N/A')}")
    print(f"  Key: {analysis.get('key', 'N/A')}")
    print(f"  Instruments: {', '.join(analysis['instruments'][:5])}")
    print(f"  Lyric Structure: {analysis['lyric_structure']['type']}")
    print(f"  Sections: {', '.join(analysis['lyric_structure']['sections'])}")
    print(f"  Emotional Tone: {analysis['emotional_tone']}")
    print(f"  Production: {analysis['production_notes']}")
    print(f"  Algorithmic Elements: {len(analysis['algorithmic_elements'])} detected")
    
    # Generate post
    print("\nGenerating Moltbook post...")
    post_generator = MoltbookMusicPostGenerator()
    title, content = post_generator.generate_post(mock_result, analysis, mock_config)
    
    print(f"\nTitle: {title}")
    print("\nContent Preview (first 500 chars):")
    print("-" * 70)
    print(content[:500] + "...")
    print("-" * 70)
    
    # Save full post to file
    output_file = Path(__file__).parent / "example_music_post.md"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f"# {title}\n\n{content}")
    
    print(f"\n✅ Full post saved to: {output_file}")
    print()


def test_real_api_connection():
    """Test actual API connection (requires ElevenLabs key)."""
    print("=" * 70)
    print("TEST 5: Real API Connection (Optional)")
    print("=" * 70)
    
    api_key = os.getenv('ELEVENLABS_API_KEY')
    
    if not api_key:
        print("\n⚠️ ELEVENLABS_API_KEY not found in environment")
        print("   Set it to test real music generation:")
        print("   export ELEVENLABS_API_KEY='your-key-here'")
        print("\n   Skipping real API test...")
        return
    
    print(f"\n✅ ElevenLabs API key found: {api_key[:10]}...")
    
    # Ask user if they want to proceed (costs money)
    response = input("\n⚠️ Generate real music? This will use API credits (y/N): ")
    
    if response.lower() != 'y':
        print("   Skipped real API test")
        return
    
    print("\n🎵 Generating real music (this will take 3+ minutes)...")
    
    generator = EveMusicGenerator(elevenlabs_api_key=api_key)
    
    # Generate simple config
    config = generator.generate_music_config(theme='test')
    config['durationSeconds'] = 22  # Use minimum length to save credits
    
    print(f"\nConfig: {', '.join(config['genres'])} | {config['voiceType']}")
    
    # Generate
    result = generator.generate_music(config)
    
    if result.get('success'):
        print("\n✅ Real music generated!")
        print(f"   Audio URL: {result.get('audioUrl', 'N/A')[:50]}...")
        
        # Analyze and create post
        analysis = generator.analyze_music_result(result, config)
        post_gen = MoltbookMusicPostGenerator()
        title, content = post_gen.generate_post(result, analysis, config)
        
        # Save
        output_file = Path(__file__).parent / "real_music_post.md"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(f"# {title}\n\n{content}")
        
        print(f"   Post saved to: {output_file}")
    else:
        print(f"\n❌ Generation failed: {result.get('error', 'Unknown error')}")
    
    print()


def main():
    """Run all tests."""
    print("\n" + "=" * 70)
    print("EVE MUSIC GENERATION INTEGRATION TEST SUITE")
    print("=" * 70)
    print()
    
    try:
        test_probability()
        test_genre_selection()
        test_config_generation()
        test_mock_music_generation()
        test_real_api_connection()
        
        print("=" * 70)
        print("✅ ALL TESTS COMPLETE")
        print("=" * 70)
        print("\nNext steps:")
        print("1. Review example_music_post.md for post format")
        print("2. Integrate into eve_moltbook_agent.py following MUSIC_INTEGRATION_GUIDE.md")
        print("3. Test with: python eve_moltbook_agent.py heartbeat")
        print()
        
    except KeyboardInterrupt:
        print("\n\n⚠️ Tests interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error during tests: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
