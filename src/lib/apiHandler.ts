import { MusicConfig, GenerationResult } from './types'
import { MusicGenerator } from './musicGenerator'

export interface ApiGenerateRequest {
  mode: 'suno' | 'elevenlabs'
  genres: string[]
  description: string
  voiceType: 'instrumental' | 'male' | 'female'
  weirdness: number
  style: number
  audio: number
  durationSeconds: number
  lyricsTheme?: string
  customLyrics?: string
  elevenLabsApiKey?: string
}

export interface ApiGenerateResponse {
  success: boolean
  mode: 'suno' | 'elevenlabs'
  audioUrl?: string
  lyrics?: string
  stylePrompt?: string
  generationPrompt?: string
  metadata?: Record<string, any>
  error?: string
}

export async function handleMusicGenerationRequest(
  request: ApiGenerateRequest
): Promise<ApiGenerateResponse> {
  try {
    const config: MusicConfig = {
      mode: request.mode,
      genres: request.genres,
      description: request.description,
      voiceType: request.voiceType,
      weirdness: request.weirdness,
      style: request.style,
      audio: request.audio,
      durationSeconds: request.durationSeconds,
      lyricsTheme: request.lyricsTheme,
      customLyrics: request.customLyrics,
    }

    const generator = new MusicGenerator(config)
    
    const result: GenerationResult = await generator.generate({
      elevenLabsApiKey: request.elevenLabsApiKey,
    })

    if (!result.success) {
      return {
        success: false,
        mode: request.mode,
        error: result.error || 'Generation failed',
      }
    }

    return {
      success: true,
      mode: result.mode,
      audioUrl: result.audioUrl,
      lyrics: result.lyrics,
      stylePrompt: result.stylePrompt,
      generationPrompt: result.generationPrompt,
      metadata: result.metadata,
    }
  } catch (error) {
    return {
      success: false,
      mode: request.mode,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export function setupApiRoutes() {
  if (typeof window === 'undefined') {
    return
  }

  (window as any).__EVE_MUSIC_API__ = {
    generate: handleMusicGenerationRequest,
  }
}
