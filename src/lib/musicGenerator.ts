import { MusicConfig, GenerationResult, METRONOME_TAG, ANCIENT_KEY, PHI } from './types'
import { AlgorithmicResonance } from './algorithms'
import { createPrompt, callLLM } from './sparkUtils'

export class MusicGenerator {
  private config: MusicConfig
  private algorithms: AlgorithmicResonance

  constructor(config: MusicConfig) {
    this.config = config
    this.algorithms = new AlgorithmicResonance(config)
  }

  async generate(options?: { randomizeStyle?: boolean; randomizeLyrics?: boolean; elevenLabsApiKey?: string }): Promise<GenerationResult> {
    if (this.config.mode === 'suno') {
      return this.generateSunoExport(options)
    } else {
      return this.generateElevenLabs(options?.elevenLabsApiKey)
    }
  }

  private async generateSunoExport(options?: { randomizeStyle?: boolean; randomizeLyrics?: boolean }): Promise<GenerationResult> {
    try {
      const lyrics = options?.randomizeLyrics && !this.config.customLyrics?.trim()
        ? await this.randomizeLyrics()
        : await this.generateLyrics()
      const stylePrompt = options?.randomizeStyle 
        ? await this.randomizeStylePrompt()
        : this.generateStylePrompt()

      return {
        success: true,
        mode: 'suno',
        lyrics,
        stylePrompt,
        metadata: {
          genres: this.config.genres,
          weirdness: this.config.weirdness,
          style: this.config.style,
          audio: this.config.audio,
          durationSeconds: this.config.durationSeconds,
        },
      }
    } catch (error) {
      return {
        success: false,
        mode: 'suno',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async generateElevenLabs(apiKey?: string): Promise<GenerationResult> {
    try {
      const vocalStyleContext = this.config.vocalStyle && this.config.vocalStyle !== 'none'
        ? `\n- Vocal Style: ${this.config.vocalStyle} delivery`
        : ''

      const promptForLLM = createPrompt`You are Eve, an AI music generation agent. Based on this music configuration, generate a detailed and evocative music generation prompt for the ElevenLabs Music API.

Configuration:
- Genres: ${this.config.genres.join(', ')}
- Description: ${this.config.description}
- Voice Type: ${this.config.voiceType}${vocalStyleContext}
- Weirdness: ${this.config.weirdness}/100 (experimental nature)
- Style: ${this.config.style}/100 (genre adherence)
- Audio: ${this.config.audio}/100 (production quality)
- Duration: ${this.config.durationSeconds} seconds

CRITICAL REQUIREMENTS:
1. MAXIMUM 400 characters - this is a hard API limit
2. ALWAYS include "heavy 808 bass and percussion" - this is mandatory
3. Map sliders to descriptive terms:
   - Weirdness ${this.config.weirdness}: ${this.mapWeirdnessToDescription(this.config.weirdness)}
   - Style ${this.config.style}: ${this.mapStyleToDescription(this.config.style)}
   - Audio ${this.config.audio}: ${this.mapAudioToDescription(this.config.audio)}
4. Add poetic essence: ${this.algorithms.getPoeticEssence()}
5. Include structure hint based on ${this.config.durationSeconds}s duration
${this.config.vocalStyle && this.config.vocalStyle !== 'none' ? `6. Emphasize ${this.config.vocalStyle} vocal delivery style` : ''}

Be highly concise and evocative. Every word counts. Return ONLY the music generation prompt text, nothing else.`

      let enhancedPrompt = await callLLM(promptForLLM, 'gpt-4o-mini')
      enhancedPrompt = enhancedPrompt.trim()

      if (enhancedPrompt.length > 400) {
        enhancedPrompt = enhancedPrompt.substring(0, 397) + '...'
      }

      let lyrics: string | undefined = undefined
      if (this.config.voiceType !== 'instrumental') {
        lyrics = await this.generateElevenLabsLyrics()
      }

      if (!apiKey) {
        return {
          success: true,
          mode: 'elevenlabs',
          generationPrompt: enhancedPrompt,
          lyrics,
          durationMs: this.config.durationSeconds * 1000,
          metadata: {
            genres: this.config.genres,
            weirdness: this.config.weirdness,
            style: this.config.style,
            audio: this.config.audio,
            durationSeconds: this.config.durationSeconds,
            voiceType: this.config.voiceType,
            vocalStyle: this.config.vocalStyle,
          },
        }
      }

      const { ElevenLabsService } = await import('./elevenLabsService')
      const elevenLabs = new ElevenLabsService(apiKey)

      const promptInfluence = this.config.style / 100

      const musicResult = await elevenLabs.generateMusic({
        text: enhancedPrompt,
        duration_seconds: Math.min(Math.max(this.config.durationSeconds, 3), 300),
        prompt_influence: promptInfluence,
        lyrics,
        genres: this.config.genres,
      })

      if (!musicResult.success || !musicResult.audioUrl) {
        return {
          success: false,
          mode: 'elevenlabs',
          error: musicResult.error || 'Failed to generate music',
        }
      }

      return {
        success: true,
        mode: 'elevenlabs',
        generationPrompt: enhancedPrompt,
        lyrics,
        audioUrl: musicResult.audioUrl,
        durationMs: this.config.durationSeconds * 1000,
        metadata: {
          genres: this.config.genres,
          weirdness: this.config.weirdness,
          style: this.config.style,
          audio: this.config.audio,
          durationSeconds: this.config.durationSeconds,
          voiceType: this.config.voiceType,
          vocalStyle: this.config.vocalStyle,
          audioBlob: musicResult.audioBlob,
        },
      }
    } catch (error) {
      return {
        success: false,
        mode: 'elevenlabs',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private buildElevenLabsPrompt(): string {
    const parts: string[] = []

    const genresStr = this.config.genres.slice(0, 3).join(' with ')
    parts.push(`${genresStr} track`)

    parts.push('with heavy 808 bass and percussion throughout')

    const weirMod = this.mapWeirdnessToDescription(this.config.weirdness)
    const styleMod = this.mapStyleToDescription(this.config.style)
    const audioMod = this.mapAudioToDescription(this.config.audio)
    parts.push(`${weirMod}, ${styleMod}, ${audioMod} production`)

    const algoDesc = this.algorithms.getElevenLabsDescription()
    if (algoDesc) parts.push(algoDesc)

    parts.push(`Mood: ${this.config.description}`)

    const poetic = this.algorithms.getPoeticEssence()
    if (poetic) parts.push(poetic)

    const structure = this.getStructureHint()
    parts.push(structure)

    return parts.join('. ') + '.'
  }

  private mapWeirdnessToDescription(value: number): string {
    if (value < 30) return 'conventional and structured'
    if (value < 60) return 'moderately experimental'
    return 'highly experimental and avant-garde'
  }

  private mapStyleToDescription(value: number): string {
    if (value < 30) return 'loose genre interpretation with fusion elements'
    if (value < 60) return 'clear genre identity'
    return 'strict genre adherence'
  }

  private mapAudioToDescription(value: number): string {
    if (value < 30) return 'raw and lo-fi'
    if (value < 60) return 'balanced'
    return 'pristine and studio-grade'
  }

  private getStructureHint(): string {
    const duration = this.config.durationSeconds
    if (duration < 30) return 'Brief structure: intro, main section, outro'
    if (duration < 90) return 'Structure: intro, build, drop, breakdown, finale'
    return 'Extended structure: intro, verse, build, drop, breakdown, second drop, extended outro'
  }

  private async generateElevenLabsLyrics(): Promise<string> {
    if (this.config.customLyrics && this.config.customLyrics.trim()) {
      return this.config.customLyrics.trim()
    }

    const themeContext = this.config.lyricsTheme 
      ? `Theme/concept: ${this.config.lyricsTheme}\n` 
      : ''

    const vocalStyleContext = this.config.vocalStyle && this.config.vocalStyle !== 'none'
      ? `Vocal Style: ${this.config.vocalStyle} - write lyrics that complement this vocal delivery style\n`
      : ''

    const promptForLLM = createPrompt`You are Eve, an AI music generation agent. Generate concise lyrics for ElevenLabs Music API for a ${this.config.genres.join(', ')} track.

Description: "${this.config.description}"
${themeContext}${vocalStyleContext}Voice Type: ${this.config.voiceType}
Duration: ${this.config.durationSeconds} seconds

CRITICAL REQUIREMENTS:
1. MAXIMUM 450 characters - this is a hard API limit for ElevenLabs
2. NO meta-tags or special formatting like [Verse], [Chorus], etc.
3. Just plain lyrics text that flows naturally
4. Match the mood and energy described
5. For ${this.config.voiceType} voice${this.config.vocalStyle && this.config.vocalStyle !== 'none' ? ` with ${this.config.vocalStyle} delivery` : ''}
6. ${this.getDurationGuidance()}

Return ONLY the plain lyrics text, nothing else. Be concise but evocative.`

    const lyrics = await callLLM(promptForLLM, 'gpt-4o-mini')
    let trimmedLyrics = lyrics.trim()

    if (trimmedLyrics.length > 450) {
      trimmedLyrics = trimmedLyrics.substring(0, 447) + '...'
    }

    return trimmedLyrics
  }

  private async generateLyrics(): Promise<string> {
    if (this.config.customLyrics && this.config.customLyrics.trim()) {
      return this.config.customLyrics
    }

    const structure = this.determineStructure()
    const durationHint = this.getDurationHintForLyrics()

    const themeContext = this.config.lyricsTheme 
      ? `Theme/concept: ${this.config.lyricsTheme}\n` 
      : ''

    const vocalStyleGuidance = this.getVocalStyleGuidance()

    const promptForLLM = createPrompt`You are Eve, an AI music generation agent specializing in creating Suno.com lyrics with meta-tags.

Generate lyrics for a ${this.config.genres.join(', ')} track with this description: "${this.config.description}"
${themeContext}
REQUIREMENTS:
1. Start with ${METRONOME_TAG}
2. Use these sections in order: ${structure.join(', ')}
3. ${durationHint}
4. Use Suno meta-tags:
   - Section tags: [Intro], [Verse], [Chorus], [Bridge], [Drop], [Outro], etc.
   - Audio FX: [[808 drop]], [[reverb]], [[glitch]], [[fade]], etc.
   - Vocal FX (if not instrumental): ${vocalStyleGuidance}
5. Voice type: ${this.config.voiceType}${this.config.vocalStyle && this.config.vocalStyle !== 'none' ? ` with ${this.config.vocalStyle} style` : ''}
6. Weirdness level: ${this.config.weirdness}/100 - ${this.config.weirdness > 60 ? 'use experimental/chaotic elements' : 'keep structured'}
7. ALWAYS include [[808 drop]] or [[808 bass]] in drop/heavy sections
8. Make lyrics match the description and mood
9. Duration target: ${this.config.durationSeconds} seconds - ${this.getDurationGuidance()}

Return ONLY the formatted lyrics with meta-tags, no explanations.`

    const lyrics = await callLLM(promptForLLM, 'gpt-4o')
    return lyrics.trim()
  }

  private getVocalStyleGuidance(): string {
    if (!this.config.vocalStyle || this.config.vocalStyle === 'none') {
      return '[whisper], [growl], [rap], [powerful vocals], etc.'
    }

    const styleMap: Record<string, string> = {
      'soft': '[soft vocals], [gentle], [intimate] - use throughout',
      'powerful': '[powerful vocals], [strong], [belting] - use throughout',
      'raspy': '[raspy], [gritty], [rough vocals] - use throughout',
      'breathy': '[breathy], [whispered], [airy vocals] - use throughout',
      'operatic': '[operatic], [dramatic], [soaring vocals] - use throughout',
      'rap': '[rap], [rhythmic], [spoken] - use throughout',
      'spoken-word': '[spoken word], [narrative], [poetic] - use throughout',
      'whispered': '[whisper], [hushed], [intimate] - use throughout',
      'choir': '[choir], [layered voices], [harmonies] - use throughout',
      'harmonized': '[harmonized], [vocal layers], [backing vocals] - use throughout',
      'auto-tuned': '[auto-tuned], [processed], [robotic] - use throughout',
    }

    return styleMap[this.config.vocalStyle] || '[whisper], [growl], [rap], [powerful vocals], etc.'
  }

  private getDurationHintForLyrics(): string {
    const duration = this.config.durationSeconds
    if (duration < 60) {
      return 'Create a SHORT song with minimal verses and one chorus'
    } else if (duration < 120) {
      return 'Create a STANDARD length song with 2 verses and repeated chorus'
    } else if (duration < 180) {
      return 'Create a LONG song with 3 verses, bridge, and extended sections'
    } else {
      return 'Create an EXTENDED song with multiple verses, bridge, breakdown, and extended outro'
    }
  }

  private getDurationGuidance(): string {
    const duration = this.config.durationSeconds
    if (duration < 60) {
      return 'short format (intro, verse, chorus, outro)'
    } else if (duration < 120) {
      return 'standard format (intro, verse, chorus, verse, chorus, outro)'
    } else if (duration < 180) {
      return 'long format (intro, verse, chorus, verse, chorus, bridge, chorus, outro)'
    } else {
      return 'extended format (multiple verses, repeated sections, bridge, breakdown, extended outro)'
    }
  }

  private determineStructure(): string[] {
    if (this.config.weirdness > 70) {
      return ['Intro', 'Verse 1', 'Glitch Break', 'Chorus', 'Chaos Section', 'Verse 2', 'Breakdown', 'Final Drop', 'Outro']
    }

    const genreLower = this.config.genres.map(g => g.toLowerCase())
    if (genreLower.some(g => ['trap', 'edm', 'dubstep', 'bass music'].includes(g))) {
      return ['Intro', 'Build', 'Drop', 'Verse', 'Build', 'Drop 2', 'Breakdown', 'Final Drop', 'Outro']
    }

    return ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Chorus', 'Outro']
  }

  private generateStylePrompt(): string {
    const parts: string[] = []

    parts.push(METRONOME_TAG)

    const genresStr = this.config.genres.join(', ')
    parts.push(genresStr)

    const bpmKey = this.generateBpmAndKey()
    parts.push(bpmKey)

    const instruments = this.generateInstruments()
    parts.push(`Instruments: ${instruments}`)

    const notes = this.generateNotesAndKeys()
    parts.push(`Notes: ${notes}`)

    const algoFormulas = this.algorithms.getFormulasForPrompt()
    if (algoFormulas) parts.push(algoFormulas)

    const poetic = this.generatePoeticDescription()
    parts.push(`Poetic essence: ${poetic}`)

    parts.push(ANCIENT_KEY)

    return parts.join('\n')
  }

  private generateBpmAndKey(): string {
    const genreLower = this.config.genres.map(g => g.toLowerCase())
    let baseBpm = 140

    if (genreLower.some(g => ['trap', 'hip-hop'].includes(g))) {
      baseBpm = 130 + Math.floor(Math.random() * 20)
    } else if (genreLower.some(g => ['drum and bass', 'dnb', 'jungle'].includes(g))) {
      baseBpm = 160 + Math.floor(Math.random() * 20)
    } else if (genreLower.some(g => ['techno', 'house'].includes(g))) {
      baseBpm = 120 + Math.floor(Math.random() * 10)
    } else if (genreLower.some(g => ['ambient', 'downtempo'].includes(g))) {
      baseBpm = 60 + Math.floor(Math.random() * 30)
    }

    const algoBpm = this.algorithms.getBpmModulation(baseBpm)

    const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    const modes = ['minor', 'major', 'dorian', 'phrygian', 'mixolydian']

    let mode = modes[Math.floor(Math.random() * modes.length)]
    if (genreLower.some(g => ['industrial', 'trap', 'metal'].includes(g))) {
      mode = Math.random() > 0.5 ? 'minor' : 'phrygian'
    }

    const key = `${keys[Math.floor(Math.random() * keys.length)]} ${mode}`

    if (algoBpm) {
      return `BPM: ${algoBpm}, Key: ${key}`
    } else {
      return `BPM: ${baseBpm}, Key: ${key}`
    }
  }

  private generateInstruments(): string {
    const instruments = ["Heavy 808's"]

    const genreLower = this.config.genres.map(g => g.toLowerCase())

    if (genreLower.some(g => ['trap', 'hip-hop'].includes(g))) {
      instruments.push('hi-hats', 'snare rolls', 'sub bass')
    }

    if (genreLower.some(g => ['industrial', 'metal', 'nu-metal'].includes(g))) {
      instruments.push('industrial percussion', 'distorted synths', 'metallic hits')
    }

    if (genreLower.some(g => ['glitchcore', 'experimental'].includes(g))) {
      instruments.push('glitch synths', 'granular textures', 'chaotic percussion')
    }

    if (genreLower.some(g => ['ambient', 'atmospheric'].includes(g))) {
      instruments.push('atmospheric pads', 'ambient drones', 'reverb tails')
    }

    if (this.config.weirdness > 60) {
      instruments.push('chaotic elements')
    }

    return instruments.slice(0, 5).join(', ')
  }

  private generateNotesAndKeys(): string {
    const elements: string[] = []

    if (this.config.weirdness > 40) {
      elements.push('chromatic dissonance')
    }

    const genreLower = this.config.genres.map(g => g.toLowerCase())

    if (genreLower.some(g => ['trap', 'hip-hop'].includes(g))) {
      elements.push('minor key emphasis')
    }

    if (genreLower.some(g => ['industrial', 'metal'].includes(g))) {
      elements.push('tritone intervals', 'power chords')
    }

    if (elements.length > 0) {
      return elements.join(', ')
    }

    return 'harmonic foundation'
  }

  private generatePoeticDescription(): string {
    const base = this.config.description
    const algoEssence = this.algorithms.getPoeticEssence()

    if (algoEssence) {
      return `${base}, ${algoEssence}`
    }

    return base
  }

  async analyzeSliders(): Promise<{ weirdness: string; style: string; audio: string; overall: string }> {
    const promptForLLM = createPrompt`You are Eve, an AI music generation expert. Analyze these slider settings for a ${this.config.mode === 'suno' ? 'Suno export' : 'ElevenLabs generation'}.

Genres: ${this.config.genres.join(', ')}
Weirdness: ${this.config.weirdness}/100
Style: ${this.config.style}/100
Audio: ${this.config.audio}/100

For each slider, provide a 1-2 sentence description of what this value means in the context of these genres.

${this.config.mode === 'suno' ? 'Note: In Suno mode, sliders are informational - they describe what to expect when generating on Suno.com' : 'Note: In ElevenLabs mode, sliders functionally control the actual generation.'}

Return as JSON:
{
  "weirdness": "description",
  "style": "description", 
  "audio": "description",
  "overall": "overall sound description"
}`

    try {
      const response = await callLLM(promptForLLM, 'gpt-4o-mini', true)
      const analysis = JSON.parse(response)
      return analysis
    } catch (error) {
      return {
        weirdness: this.getWeirdnessDescription(this.config.weirdness),
        style: this.getStyleDescription(this.config.style),
        audio: this.getAudioDescription(this.config.audio),
        overall: 'Configuration analyzed',
      }
    }
  }

  private getWeirdnessDescription(value: number): string {
    if (value < 30) return 'Conventional, structured, predictable patterns'
    if (value < 60) return 'Moderately experimental, balanced creativity'
    return 'Highly experimental, unconventional, avant-garde'
  }

  private getStyleDescription(value: number): string {
    if (value < 30) return 'Loose genre interpretation, fusion elements'
    if (value < 60) return 'Clear genre identity, some crossover'
    return 'Strict genre adherence, pure style'
  }

  private getAudioDescription(value: number): string {
    if (value < 30) return 'Raw, lo-fi, unpolished aesthetic'
    if (value < 60) return 'Balanced production, organic feel'
    return 'Pristine, studio-grade, polished'
  }

  async recommendSliders(): Promise<{ weirdness: number; style: number; audio: number; reasoning: string }> {
    const promptForLLM = createPrompt`You are Eve, an AI music generation expert. Recommend slider values (0-100) for these settings:

Genres: ${this.config.genres.join(', ')}
Description: ${this.config.description}

Recommend values for:
- Weirdness (0=conventional, 100=experimental)
- Style (0=loose/fusion, 100=strict genre)
- Audio (0=lo-fi, 100=studio-grade)

Consider genre conventions and the user's description.

Return as JSON:
{
  "weirdness": number,
  "style": number,
  "audio": number,
  "reasoning": "brief explanation"
}`

    try {
      const response = await callLLM(promptForLLM, 'gpt-4o-mini', true)
      const recommendations = JSON.parse(response)
      return recommendations
    } catch (error) {
      return this.getDefaultRecommendations()
    }
  }

  private getDefaultRecommendations(): { weirdness: number; style: number; audio: number; reasoning: string } {
    const genreLower = this.config.genres.map(g => g.toLowerCase())

    let weirdness = 50
    let style = 50
    let audio = 50

    if (genreLower.some(g => ['glitchcore', 'experimental', 'noise'].includes(g))) {
      weirdness = 75
    }

    if (genreLower.some(g => ['trap', 'hip-hop', 'house', 'techno'].includes(g))) {
      style = 70
    }

    if (genreLower.some(g => ['lo-fi', 'lofi', 'bedroom', 'indie'].includes(g))) {
      audio = 35
    }

    if (genreLower.some(g => ['pop', 'edm', 'trance', 'dubstep'].includes(g))) {
      audio = 80
    }

    return {
      weirdness,
      style,
      audio,
      reasoning: 'Based on genre conventions',
    }
  }

  async enhanceDescription(description: string): Promise<string> {
    const promptForLLM = createPrompt`You are Eve, an AI music generation expert. Enhance this music description to be more evocative and detailed while maintaining the core intent.

Original: "${description}"
Genres: ${this.config.genres.join(', ')}

Make it more vivid, add sensory details, suggest mood and energy. Keep it under 300 characters. Return ONLY the enhanced description, nothing else.`

    try {
      const enhanced = await callLLM(promptForLLM, 'gpt-4o-mini')
      return enhanced.trim()
    } catch (error) {
      return description
    }
  }

  async enhanceLyrics(lyrics: string, theme?: string): Promise<string> {
    const themeContext = theme ? `Theme: ${theme}\n` : ''
    
    const promptForLLM = createPrompt`You are Eve, an AI music generation expert. Enhance or complete these lyrics for a ${this.config.genres.join(', ')} track.

${themeContext}Original lyrics or ideas:
"${lyrics}"

REQUIREMENTS:
1. Start with ${METRONOME_TAG}
2. Enhance the lyrics while keeping the core ideas
3. Add proper Suno meta-tags: [Intro], [Verse], [Chorus], [Bridge], [Drop], [Outro]
4. Add audio FX tags: [[808 drop]], [[reverb]], [[glitch]], etc.
5. Voice type: ${this.config.voiceType}
6. Format for ${this.config.durationSeconds} seconds - ${this.getDurationGuidance()}
7. ALWAYS include [[808 drop]] or [[808 bass]] in heavy sections

Return ONLY the complete formatted lyrics with meta-tags.`

    try {
      const enhanced = await callLLM(promptForLLM, 'gpt-4o')
      return enhanced.trim()
    } catch (error) {
      return lyrics
    }
  }

  async randomizeLyrics(): Promise<string> {
    const structure = this.determineStructure()
    const durationHint = this.getDurationHintForLyrics()
    const themeContext = this.config.lyricsTheme 
      ? `Theme: ${this.config.lyricsTheme}\n` 
      : ''

    const promptForLLM = createPrompt`You are Eve, an AI music generation agent. Generate RANDOM and CREATIVE lyrics for a ${this.config.genres.join(', ')} track.

${themeContext}Description: ${this.config.description}

BE CREATIVE AND UNEXPECTED with the lyrics while staying true to the genres and mood. Use surprising metaphors, unique perspectives, and vivid imagery.

REQUIREMENTS:
1. Start with ${METRONOME_TAG}
2. Use these sections: ${structure.join(', ')}
3. ${durationHint}
4. Use Suno meta-tags: [Intro], [Verse], [Chorus], [Bridge], [Drop], [Outro], etc.
5. Add audio FX: [[808 drop]], [[reverb]], [[glitch]], [[fade]], etc.
6. Voice type: ${this.config.voiceType}
7. Weirdness level: ${this.config.weirdness}/100
8. ALWAYS include [[808 drop]] or [[808 bass]] in heavy sections
9. Duration: ${this.config.durationSeconds} seconds - ${this.getDurationGuidance()}

Return ONLY the formatted lyrics with meta-tags.`

    try {
      const randomLyrics = await callLLM(promptForLLM, 'gpt-4o')
      return randomLyrics.trim()
    } catch (error) {
      return this.generateLyrics()
    }
  }

  async randomizeStylePrompt(): Promise<string> {
    const promptForLLM = createPrompt`You are Eve, an AI music generation expert. Generate a RANDOM and creative style prompt for Suno.com based on these genres: ${this.config.genres.join(', ')}

Create a unique combination of:
- Random BPM appropriate to genre (but unexpected)
- Random key and mode
- Unexpected instrument combinations
- Creative effects and production techniques
- Always include "Heavy 808's"

Be creative and surprising while staying musically coherent. Include ${METRONOME_TAG} at the start.
Include the ancient key: ${ANCIENT_KEY}

Return ONLY the style prompt, formatted with line breaks.`

    try {
      const randomStyle = await callLLM(promptForLLM, 'gpt-4o-mini')
      return randomStyle.trim()
    } catch (error) {
      return this.generateStylePrompt()
    }
  }
}
