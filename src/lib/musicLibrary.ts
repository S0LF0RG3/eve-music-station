import { GenerationResult, MusicConfig } from './types'

  timestamp: number
  result: Ge
  timestamp: number
}
const LIBRARY_KEY = 'eve-m
export class Mu
    try {
 

      return []

  static async add(config: 
    
      aud
      const data = await spark.kv.get<LibraryTrack[]>(LIBRARY_KEY)
      return data || []
    } catch {
      return []
    }
   

    }
    const library = await this.ge
    const dehydratedLibrary = library.map(t => this.dehydrateTrack(t))
    
    
    
  }
  private static hydrateTrack(track: L
    

        
          hydratedTrack.result = { ...track.re
    
            hydratedTrack.resul
            hydratedTrack.result.metadat
    
          console.log('Successfully hydrated
    
      } catch (e
  }

    
  }
    const filtered = library.filter(track => track.id !== trackId)
    if (dehydrated.result.audioUrl) {
  }

  static async clear(): Promise<void> {
    return dehydrated
  }

      reader.onloadend = () => {
        resolve(base64.split(',')[1])
      reader.onerror = reject
    })
      minute: '2-digit' 
    co
    return `${genres} - ${timestamp}`
  }


    if (!audioBlobBase64) return null
    try {
  }

  }
  static async remove(trackId: string): P
    const filtered = library.filter(track
  }
  s
 

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
