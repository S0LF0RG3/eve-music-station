import { GenerationResult, MusicConfig } from './types'

export interface LibraryTrack {
  id: string
  timestamp: number
  config: MusicConfig
  result: GenerationResult
  title: string
  description: string
  audioBlobBase64?: string
}

const LIBRARY_KEY = 'eve-music-library'

export class MusicLibrary {
  static async getAll(): Promise<LibraryTrack[]> {
    try {
      const data = await window.spark.kv.get<LibraryTrack[]>(LIBRARY_KEY)
      if (!data) return []
      
      return data.map(track => this.hydrateTrack(track))
    } catch {
      return []
    }
  }

  static async add(config: MusicConfig, result: GenerationResult): Promise<LibraryTrack> {
    let audioBlobBase64: string | undefined
    
    if (result.metadata?.audioBlob) {
      audioBlobBase64 = await this.blobToBase64(result.metadata.audioBlob)
    }

    const resultToStore = { ...result }
    if (resultToStore.metadata?.audioBlob) {
      delete resultToStore.metadata.audioBlob
    }

    const track: LibraryTrack = {
      id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      config,
      result: resultToStore,
      title: this.generateTitle(config),
      description: config.description,
      audioBlobBase64,
    }

    const library = await this.getAll()
    
    const dehydratedLibrary = library.map(t => this.dehydrateTrack(t))
    dehydratedLibrary.unshift(this.dehydrateTrack(track))
    
    const trimmed = dehydratedLibrary.slice(0, 50)
    
    await window.spark.kv.set(LIBRARY_KEY, trimmed)
    
    return this.hydrateTrack(track)
  }

  private static hydrateTrack(track: LibraryTrack): LibraryTrack {
    if (track.audioBlobBase64 && !track.result.audioUrl) {
      try {
        const blob = this.base64ToBlob(track.audioBlobBase64, 'audio/mpeg')
        
        if (blob && blob instanceof Blob && blob.size > 0) {
          track.result.audioUrl = URL.createObjectURL(blob)
          
          if (!track.result.metadata) {
            track.result.metadata = {}
          }
          track.result.metadata.audioBlob = blob
        } else {
          console.warn('Invalid blob created for track:', track.id)
        }
      } catch (error) {
        console.error('Error hydrating track audio:', error, track.id)
      }
    }
    
    return track
  }

  private static dehydrateTrack(track: LibraryTrack): LibraryTrack {
    const dehydrated = { ...track }
    if (dehydrated.result.audioUrl) {
      dehydrated.result = { ...dehydrated.result }
      delete dehydrated.result.audioUrl
    }
    if (dehydrated.result.metadata?.audioBlob) {
      dehydrated.result.metadata = { ...dehydrated.result.metadata }
      delete dehydrated.result.metadata.audioBlob
    }
    return dehydrated
  }

  private static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        resolve(base64.split(',')[1])
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  private static base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
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

  static getShareUrl(trackId: string): string {
    return `${window.location.origin}/share/${trackId}`
  }

  static getEmbedCode(trackId: string, width: string = '100%', height: string = '400'): string {
    const shareUrl = this.getShareUrl(trackId)
    return `<iframe src="${shareUrl}?embedded=true" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`
  }
}
