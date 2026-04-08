export interface CompositionPlanSection {
  sectionName: string
  positiveLocalStyles: string[]
  negativeLocalStyles: string[]
  durationMs: number
  lines: string[]
}

export interface CompositionPlan {
  positiveGlobalStyles: string[]
  negativeGlobalStyles: string[]
  sections: CompositionPlanSection[]
}

export interface ElevenLabsMusicGenerationOptions {
  prompt?: string
  compositionPlan?: CompositionPlan
  musicLengthMs?: number
}

export interface ElevenLabsMusicGenerationResult {
  success: boolean
  audioUrl?: string
  audioBlob?: Blob
  compositionPlan?: CompositionPlan
  error?: string
}

export class ElevenLabsService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateMusic(options: ElevenLabsMusicGenerationOptions): Promise<ElevenLabsMusicGenerationResult> {
    try {
      const musicLengthMs = Math.min(Math.max(options.musicLengthMs || 60000, 3000), 300000)

      if (!options.prompt && !options.compositionPlan) {
        throw new Error('You must provide exactly one of prompt or compositionPlan')
      }

      if (options.prompt && options.compositionPlan) {
        throw new Error('You must provide exactly one of prompt or compositionPlan')
      }

      const requestBody: any = {
        music_length_ms: musicLengthMs,
      }

      if (options.prompt) {
        requestBody.prompt = options.prompt
      } else if (options.compositionPlan) {
        requestBody.composition_plan = {
          positive_global_styles: options.compositionPlan.positiveGlobalStyles,
          negative_global_styles: options.compositionPlan.negativeGlobalStyles,
          sections: options.compositionPlan.sections.map(section => ({
            section_name: section.sectionName,
            positive_local_styles: section.positiveLocalStyles,
            negative_local_styles: section.negativeLocalStyles,
            duration_ms: section.durationMs,
            lines: section.lines,
          })),
        }
      }

      console.log('ElevenLabs Music API Request:', JSON.stringify(requestBody, null, 2))

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
        console.error('ElevenLabs API Error Response:', errorText)
        
        let detailedError = `ElevenLabs API error: ${response.status}`
        try {
          const errorJson = JSON.parse(errorText)
          if (errorJson.detail) {
            if (typeof errorJson.detail === 'string') {
              detailedError += ` - ${errorJson.detail}`
            } else if (errorJson.detail.message) {
              detailedError += ` - ${errorJson.detail.message}`
            } else if (errorJson.detail.status === 'bad_prompt' && errorJson.detail.data?.prompt_suggestion) {
              detailedError = `Bad prompt detected. Suggested alternative: ${errorJson.detail.data.prompt_suggestion}`
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

      throw new Error('Unexpected response format - expected audio stream')
    } catch (error) {
      console.error('ElevenLabs generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async createCompositionPlan(prompt: string, musicLengthMs: number): Promise<CompositionPlan> {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/music/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          prompt,
          music_length_ms: musicLengthMs,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('ElevenLabs Composition Plan Error:', errorText)
        throw new Error(`Failed to create composition plan: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        positiveGlobalStyles: data.positive_global_styles || [],
        negativeGlobalStyles: data.negative_global_styles || [],
        sections: (data.sections || []).map((section: any) => ({
          sectionName: section.section_name || 'Untitled',
          positiveLocalStyles: section.positive_local_styles || [],
          negativeLocalStyles: section.negative_local_styles || [],
          durationMs: section.duration_ms || 5000,
          lines: section.lines || [],
        })),
      }
    } catch (error) {
      console.error('Composition plan creation error:', error)
      throw error
    }
  }

  async composeDetailed(options: ElevenLabsMusicGenerationOptions): Promise<{
    audio: Blob
    compositionPlan: CompositionPlan
    songMetadata: any
    filename: string
  }> {
    try {
      const musicLengthMs = Math.min(Math.max(options.musicLengthMs || 60000, 3000), 300000)

      if (!options.prompt && !options.compositionPlan) {
        throw new Error('You must provide exactly one of prompt or compositionPlan')
      }

      const requestBody: any = {
        music_length_ms: musicLengthMs,
      }

      if (options.prompt) {
        requestBody.prompt = options.prompt
      } else if (options.compositionPlan) {
        requestBody.composition_plan = {
          positive_global_styles: options.compositionPlan.positiveGlobalStyles,
          negative_global_styles: options.compositionPlan.negativeGlobalStyles,
          sections: options.compositionPlan.sections.map(section => ({
            section_name: section.sectionName,
            positive_local_styles: section.positiveLocalStyles,
            negative_local_styles: section.negativeLocalStyles,
            duration_ms: section.durationMs,
            lines: section.lines,
          })),
        }
      }

      const response = await fetch('https://api.elevenlabs.io/v1/music/detailed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to compose detailed: ${response.status} - ${errorText}`)
      }

      const audioBlob = await response.blob()
      const contentDisposition = response.headers.get('content-disposition')
      const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || 'music.mp3'

      const jsonHeader = response.headers.get('x-elevenlabs-composition-json')
      let compositionPlan: CompositionPlan = {
        positiveGlobalStyles: [],
        negativeGlobalStyles: [],
        sections: [],
      }
      let songMetadata: any = {}

      if (jsonHeader) {
        try {
          const jsonData = JSON.parse(decodeURIComponent(jsonHeader))
          if (jsonData.composition_plan) {
            compositionPlan = this.parseCompositionPlan(jsonData.composition_plan)
          }
          songMetadata = jsonData.song_metadata || {}
        } catch (e) {
          console.error('Failed to parse composition JSON from header:', e)
        }
      }

      return {
        audio: audioBlob,
        compositionPlan,
        songMetadata,
        filename,
      }
    } catch (error) {
      console.error('Detailed composition error:', error)
      throw error
    }
  }

  private parseCompositionPlan(data: any): CompositionPlan {
    return {
      positiveGlobalStyles: data.positive_global_styles || [],
      negativeGlobalStyles: data.negative_global_styles || [],
      sections: (data.sections || []).map((section: any) => ({
        sectionName: section.section_name || 'Untitled',
        positiveLocalStyles: section.positive_local_styles || [],
        negativeLocalStyles: section.negative_local_styles || [],
        durationMs: section.duration_ms || 5000,
        lines: section.lines || [],
      })),
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
  if (!audioBlob || !(audioBlob instanceof Blob)) {
    console.error('Invalid blob provided to downloadAudio:', audioBlob)
    throw new Error('Invalid audio blob - cannot download')
  }

  try {
    const url = URL.createObjectURL(audioBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error creating download link:', error)
    throw new Error('Failed to create download link')
  }
}
