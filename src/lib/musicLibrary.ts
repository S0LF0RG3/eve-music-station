/// <reference types="../vite-end.d.ts" />
import { GenerationResult, MusicConfig } from './types'

export interface LibraryTrack {
  id: string
  config: MusicConfig
  timestamp: number
  result: GenerationResult
  title: string
  audioBlobBase64?: string
}

const LIBRARY_KEY = 'eve-music-library'

export class MusicLibrary {
  static async getAll(): Promise<LibraryTrack[]> {
    try {
      const data = await window.spark.kv.get<LibraryTrack[]>(LIBRARY_KEY)
      const tracks = data || []
      return tracks.map(t => this.hydrateTrack(t))
    } catch {
      return []
    }
  }

  static async add(config: MusicConfig, result: GenerationResult): Promise<string> {
    const library = await this.getAll()
    
    let audioBlobBase64: string | undefined = undefined
    
    if (result.audioUrl && result.audioUrl.startsWith('blob:')) {
      audioBlobBase64 = await this.blobUrlToBase64(result.audioUrl)
    }

    const trackId = `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const track: LibraryTrack = {
      id: trackId,
      config,
      timestamp: Date.now(),
      result,
      title: this.generateTitle(config),
      audioBlobBase64
    }

    library.unshift(track)
    
    const dehydratedLibrary = library.map(t => this.dehydrateTrack(t))
    await window.spark.kv.set(LIBRARY_KEY, dehydratedLibrary)
    
    return trackId
  }

  static async remove(trackId: string): Promise<void> {
    const library = await this.getAll()
    const filtered = library.filter(track => track.id !== trackId)
    const dehydratedLibrary = filtered.map(t => this.dehydrateTrack(t))
    await window.spark.kv.set(LIBRARY_KEY, dehydratedLibrary)
  }

  static async clear(): Promise<void> {
    await window.spark.kv.delete(LIBRARY_KEY)
  }

  static async getById(trackId: string): Promise<LibraryTrack | null> {
    const library = await this.getAll()
    return library.find(track => track.id === trackId) || null
  }

  private static hydrateTrack(track: LibraryTrack): LibraryTrack {
    try {
      const hydratedTrack = { ...track }
      
      if (track.audioBlobBase64 && track.result) {
        hydratedTrack.result = { ...track.result }
        
        const blob = this.base64ToBlob(track.audioBlobBase64, 'audio/mpeg')
        const blobUrl = URL.createObjectURL(blob)
        hydratedTrack.result.audioUrl = blobUrl
        
        if (track.result.metadata) {
          hydratedTrack.result.metadata = { ...track.result.metadata }
        }
        
        console.log('Successfully hydrated track with audio blob')
      }
      
      return hydratedTrack
    } catch (error) {
      console.error('Error hydrating track:', error)
      return track
    }
  }

  private static dehydrateTrack(track: LibraryTrack): LibraryTrack {
    const dehydrated = { ...track }
    
    if (dehydrated.result.audioUrl && dehydrated.result.audioUrl.startsWith('blob:')) {
      const resultCopy = { ...dehydrated.result }
      delete resultCopy.audioUrl
      dehydrated.result = resultCopy
    }
    
    return dehydrated
  }

  private static async blobUrlToBase64(blobUrl: string): Promise<string | undefined> {
    try {
      const response = await fetch(blobUrl)
      const blob = await response.blob()
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          resolve(base64.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error('Error converting blob to base64:', error)
      return undefined
    }
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

  private static generateTitle(config: MusicConfig): string {
    const genres = config.genres.slice(0, 2).join(' × ')
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    return `${genres} - ${timestamp}`
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
