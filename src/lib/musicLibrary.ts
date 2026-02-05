import { GenerationResult, MusicConfig } from './types'

export interface LibraryTrack {
  id: string
  timestamp: number
  config: MusicConfig
  result: GenerationResult
  title: string
  description: string
}

const LIBRARY_KEY = 'eve-music-library'

export class MusicLibrary {
  static async getAll(): Promise<LibraryTrack[]> {
    try {
      const data = await window.spark.kv.get<LibraryTrack[]>(LIBRARY_KEY)
      return data || []
    } catch {
      return []
    }
  }

  static async add(config: MusicConfig, result: GenerationResult): Promise<LibraryTrack> {
    const track: LibraryTrack = {
      id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      config,
      result,
      title: this.generateTitle(config),
      description: config.description,
    }

    const library = await this.getAll()
    library.unshift(track)
    
    const trimmed = library.slice(0, 50)
    
    await window.spark.kv.set(LIBRARY_KEY, trimmed)
    
    return track
  }

  static async remove(trackId: string): Promise<void> {
    const library = await this.getAll()
    const filtered = library.filter(track => track.id !== trackId)
    await window.spark.kv.set(LIBRARY_KEY, filtered)
  }

  static async clear(): Promise<void> {
    await window.spark.kv.delete(LIBRARY_KEY)
  }

  private static generateTitle(config: MusicConfig): string {
    const genres = config.genres.slice(0, 2).join(' × ')
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    return `${genres} - ${timestamp}`
  }

  static async getById(trackId: string): Promise<LibraryTrack | null> {
    const library = await this.getAll()
    return library.find(track => track.id === trackId) || null
  }

  static formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
}
