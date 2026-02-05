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
  section_name: string
  lyrics: string
  positive_local_styles: string[]
  negative_local_styles: string[]
  duration_ms: number
  lines: Array<{
    text: string
    duration_ms: number
  }>
}

export class ElevenLabsService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private parseSectionName(text: string): string {
    const sectionMatch = text.match(/\[(Intro|Verse(?:\s*\d*)?|Chorus|Bridge|Drop|Outro|Break|Pre-Chorus)\]/i)
    if (sectionMatch) {
      return sectionMatch[1]
    }
    return 'Verse'
  }

  private buildCompositionPlan(lyrics: string, prompt: string, genres: string[] = [], durationSeconds: number = 60) {
    const rawSections: Array<{ name: string; lyrics: string }> = []
    const lines = lyrics.split('\n')
    let currentSectionName = 'Intro'
    let currentSectionLyrics: string[] = []

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      const cleaned = trimmed.replace(/\[\[.*?\]\]/g, '').trim()
      
      const sectionMatch = cleaned.match(/^\[(Intro|Verse(?:\s*\d*)?|Chorus|Bridge|Drop|Outro|Break|Pre-Chorus)\]/i)
      
      if (sectionMatch) {
        if (currentSectionLyrics.length > 0) {
          rawSections.push({
            name: currentSectionName,
            lyrics: currentSectionLyrics.join('\n')
          })
          currentSectionLyrics = []
        }
        currentSectionName = sectionMatch[1]
        const withoutTag = cleaned.replace(/^\[.*?\]/, '').trim()
        if (withoutTag) {
          currentSectionLyrics.push(withoutTag)
        }
      } else if (cleaned && !cleaned.match(/^---/) && !cleaned.match(/\[Metronome\]/i)) {
        currentSectionLyrics.push(cleaned)
      }
    }

    if (currentSectionLyrics.length > 0) {
      rawSections.push({
        name: currentSectionName,
        lyrics: currentSectionLyrics.join('\n')
      })
    }

    if (rawSections.length === 0) {
      const cleanedLyrics = lyrics
        .replace(/\[\[.*?\]\]/g, '')
        .replace(/\[Metronome\]/gi, '')
        .replace(/^---$/gm, '')
        .trim()
      
      rawSections.push({
        name: 'Verse',
        lyrics: cleanedLyrics.substring(0, 450)
      })
    }

    const positiveStyles: string[] = []
    const negativeStyles: string[] = []

    if (genres.length > 0) {
      positiveStyles.push(...genres.slice(0, 3))
    }

    if (prompt.toLowerCase().includes('808')) {
      positiveStyles.push('heavy 808 bass')
    }
    if (prompt.toLowerCase().includes('aggressive')) {
      positiveStyles.push('aggressive vocals')
    }
    if (prompt.toLowerCase().includes('experimental')) {
      positiveStyles.push('experimental')
    }

    negativeStyles.push('generic', 'soft')

    const durationMs = durationSeconds * 1000
    const avgSectionDuration = Math.floor(durationMs / rawSections.length)

    const sections: CompositionSection[] = rawSections.map((section, idx) => {
      const sectionLyrics = section.lyrics.substring(0, 450)
      const lyricLines = sectionLyrics.split('\n').filter(l => l.trim())
      
      const sectionDuration = idx === rawSections.length - 1
        ? durationMs - (avgSectionDuration * (rawSections.length - 1))
        : avgSectionDuration
      
      const lineDuration = lyricLines.length > 0 ? Math.floor(sectionDuration / lyricLines.length) : sectionDuration

      return {
        section_name: section.name,
        lyrics: sectionLyrics,
        positive_local_styles: positiveStyles.length > 0 ? positiveStyles : ['energetic'],
        negative_local_styles: negativeStyles,
        duration_ms: sectionDuration,
        lines: lyricLines.map(text => ({
          text,
          duration_ms: lineDuration
        }))
      }
    })

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
          options.genres,
          durationSeconds
        )
      } else {
        requestBody.prompt = options.text.substring(0, 450)
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
