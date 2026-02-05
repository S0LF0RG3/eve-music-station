export interface ElevenLabsMusicGenerationOptions {
  text: string
  duration_seconds?: number
  prompt_influence?: number
  lyrics?: string
  genres?: string[]
}

export interface ElevenLabsMusicGenerationResult {
  success: boolean
  audioUrl?: string
  audioBlob?: Blob
  error?: string
}

interface CompositionSection {
  lyrics: string
  positive_section_styles?: string[]
  negative_section_styles?: string[]
}

export class ElevenLabsService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private parseAudioSection(text: string): { lyrics: string; section: string } {
    const sectionMatch = text.match(/\[(Intro|Verse|Chorus|Bridge|Drop|Outro|Break|Pre-Chorus)\]/i)
    const section = sectionMatch ? sectionMatch[1] : 'Verse'
    const lyrics = text.replace(/\[.*?\]/g, '').trim()
    return { lyrics, section }
  }

  private buildCompositionPlan(lyrics: string, prompt: string, genres: string[] = []) {
    const sections: CompositionSection[] = []
    const lines = lyrics.split('\n')
    let currentSection = ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      const cleaned = trimmed.replace(/\[\[.*?\]\]/g, '').trim()
      if (!cleaned) continue

      currentSection += (currentSection ? '\n' : '') + cleaned
      
      if (currentSection.length >= 200 || cleaned.match(/\[(Chorus|Bridge|Drop|Outro)\]/i)) {
        if (currentSection.length > 0) {
          sections.push({
            lyrics: currentSection.substring(0, 450)
          })
          currentSection = ''
        }
      }
    }

    if (currentSection.length > 0) {
      sections.push({
        lyrics: currentSection.substring(0, 450)
      })
    }

    if (sections.length === 0) {
      sections.push({
        lyrics: lyrics.substring(0, 450)
      })
    }

    const positiveStyles: string[] = []
    const negativeStyles: string[] = []

    if (genres.length > 0) {
      positiveStyles.push(...genres)
    }

    if (prompt.toLowerCase().includes('808')) {
      positiveStyles.push('808 bass', 'heavy bass')
    }
    if (prompt.toLowerCase().includes('aggressive')) {
      positiveStyles.push('aggressive', 'intense')
    }
    if (prompt.toLowerCase().includes('experimental')) {
      positiveStyles.push('experimental')
    }
    if (prompt.toLowerCase().includes('pristine') || prompt.toLowerCase().includes('polish')) {
      positiveStyles.push('high production quality')
    }

    negativeStyles.push('generic', 'bland', 'soft', 'mellow')

    return {
      positive_global_styles: positiveStyles.length > 0 ? positiveStyles : ['energetic'],
      negative_global_styles: negativeStyles,
      sections
    }
  }

  async generateMusic(options: ElevenLabsMusicGenerationOptions): Promise<ElevenLabsMusicGenerationResult> {
    try {
      const durationSeconds = Math.min(Math.max(options.duration_seconds || 60, 3), 300)

      const requestBody: {
        prompt?: string
        composition_plan?: {
          positive_global_styles: string[]
          negative_global_styles: string[]
          sections: CompositionSection[]
        }
        duration: number
        prompt_influence?: number
      } = {
        duration: durationSeconds,
      }

      if (options.lyrics && options.lyrics.trim()) {
        requestBody.composition_plan = this.buildCompositionPlan(
          options.lyrics,
          options.text,
          options.genres
        )
      } else {
        requestBody.prompt = options.text
        requestBody.prompt_influence = options.prompt_influence || 0.5
      }

      const response = await fetch('https://api.elevenlabs.io/v1/music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      return {
        success: true,
        audioUrl,
        audioBlob,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/user', {
        headers: {
          'xi-api-key': this.apiKey,
        },
      })

      return response.ok
    } catch {
      return false
    }
  }
}

export function downloadAudio(audioBlob: Blob, filename: string = 'eve-music-generation.mp3') {
  const url = URL.createObjectURL(audioBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
