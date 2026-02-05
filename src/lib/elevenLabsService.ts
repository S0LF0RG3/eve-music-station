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

export class ElevenLabsService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateMusic(options: ElevenLabsMusicGenerationOptions): Promise<ElevenLabsMusicGenerationResult> {
    try {
      const durationSeconds = Math.min(Math.max(options.duration_seconds || 60, 3), 300)

      let promptText = options.text
      if (promptText.length > 450) {
        promptText = promptText.substring(0, 447) + '...'
      }

      const requestBody: any = {
        prompt: promptText,
        duration: durationSeconds,
        mode: 'auto',
      }

      if (options.lyrics && options.lyrics.trim()) {
        const cleanLyrics = options.lyrics.trim()
        requestBody.text = cleanLyrics
      }

      console.log('ElevenLabs Music Generation API Request:', JSON.stringify(requestBody, null, 2))

      const response = await fetch('https://api.elevenlabs.io/v1/text-to-sound-effects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('ElevenLabs API Error Response:', errorText)
        
        let detailedError = `ElevenLabs API error: ${response.status}`
        try {
          const errorJson = JSON.parse(errorText)
          if (errorJson.detail) {
            if (typeof errorJson.detail === 'string') {
              detailedError += ` - ${errorJson.detail}`
            } else if (errorJson.detail.message) {
              detailedError += ` - ${errorJson.detail.message}`
            } else if (Array.isArray(errorJson.detail)) {
              detailedError += ` - ${JSON.stringify(errorJson.detail)}`
            } else {
              detailedError += ` - ${JSON.stringify(errorJson.detail)}`
            }
          }
        } catch {
          detailedError += ` - ${errorText}`
        }
        
        throw new Error(detailedError)
      }

      const contentType = response.headers.get('content-type')
      console.log('Response content-type:', contentType)
      
      if (contentType && contentType.includes('audio/')) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)

        return {
          success: true,
          audioUrl,
          audioBlob,
        }
      }
      
      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = await response.json()
        console.log('JSON Response:', jsonResponse)
        
        if (jsonResponse.audio) {
          const base64Audio = jsonResponse.audio
          const binaryString = atob(base64Audio)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          const audioBlob = new Blob([bytes], { type: 'audio/mpeg' })
          const audioUrl = URL.createObjectURL(audioBlob)
          
          return {
            success: true,
            audioUrl,
            audioBlob,
          }
        }
        
        throw new Error('No audio data in response')
      }

      throw new Error('Unexpected response format')
    } catch (error) {
      console.error('ElevenLabs generation error:', error)
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
