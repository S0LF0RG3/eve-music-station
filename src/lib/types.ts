export type GenerationMode = 'suno' | 'elevenlabs'

export type VoiceType = 'instrumental' | 'male' | 'female'

export type VocalStyle = 
  | 'none'
  | 'soft'
  | 'powerful'
  | 'raspy'
  | 'breathy'
  | 'operatic'
  | 'rap'
  | 'spoken-word'
  | 'whispered'
  | 'choir'
  | 'harmonized'
  | 'auto-tuned'
  | 'growl'
  | 'falsetto'
  | 'death-metal'
  | 'scream'
  | 'guttural'
  | 'melodic'
  | 'aggressive'

export interface MusicConfig {
  mode: GenerationMode
  genres: string[]
  description: string
  voiceType: VoiceType
  vocalStyle?: VocalStyle
  weirdness: number
  style: number
  audio: number
  durationSeconds: number
  customGenre?: string
  lyricsTheme?: string
  customLyrics?: string
}

export interface AlgorithmInfo {
  id: string
  name: string
  description: string
  formula?: string
  active: boolean
}

export interface GenerationResult {
  success: boolean
  mode: GenerationMode
  lyrics?: string
  stylePrompt?: string
  audioUrl?: string
  generationPrompt?: string
  durationMs?: number
  error?: string
  metadata?: Record<string, any>
}

export interface SliderAnalysis {
  weirdness: string
  style: string
  audio: string
  overall: string
}

export const AVAILABLE_GENRES = [
  'Trap',
  'Hip-Hop',
  'EDM',
  'House',
  'Techno',
  'Dubstep',
  'Drum and Bass',
  'Trance',
  'Ambient',
  'Downtempo',
  'Industrial',
  'Nu-Metal',
  'Glitchcore',
  'Ritualcore',
  'Pop',
  'Rock',
  'Metal',
  'Jazz',
  'Classical',
  'Funk',
  'Soul',
  'R&B',
  'Reggae',
  'Country',
  'Folk',
  'Blues',
  'Punk',
  'Hardcore',
  'Breakbeat',
  'Jungle',
  'Lo-Fi',
  'Vaporwave',
  'Synthwave',
  'Darkwave',
  'Post-Rock',
  'Math Rock',
  'Progressive',
  'Experimental',
  'Noise',
  'Minimal',
  'Deep House',
  'Tech House',
  'Bass Music',
] as const

export const PHI = 1.618033988749
export const ANCIENT_KEY = '[Mathrm {E} _{G}(F;N), {\\Displaystyle \\Varphi ={\\Frac {1+{\\Sqrt {5}}}{2}}=} 1, 618033988749] [X = As + N]'
export const METRONOME_TAG = '[Metronome]'
