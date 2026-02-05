export interface ElevenLabsMusicGenerationOptions {
  text: string
  duration_seconds?: number
  prompt_influence?: number
  lyrics?: string
}

export interface ElevenLabsMusicGenerationResult {
  success: boolean
  audioUrl?: string
  audioBlob?: Blob
  error?: string
}

export class ElevenLabsService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateMusic(options: ElevenLabsMusicGenerationOptions): Promise<ElevenLabsMusicGenerationResult> {
    try {
      const durationSeconds = Math.min(Math.max(options.duration_seconds || 60, 3), 300)

      const requestBody: {
        prompt?: string
        composition_plan?: {
          prompt: string
          lyrics?: string
        }
        duration: number
        prompt_influence?: number
      } = {
        duration: durationSeconds,
      }

      if (options.lyrics && options.lyrics.trim()) {
        requestBody.composition_plan = {
          prompt: options.text,
          lyrics: options.lyrics.trim(),
        }
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
