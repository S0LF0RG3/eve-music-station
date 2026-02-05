import { useEffect, useState } from 'react'
import { ShareablePlayer } from './ShareablePlayer'
import { MusicNotes } from '@phosphor-icons/react'
import { Button } from './ui/button'

export function SharePage() {
  const [trackId, setTrackId] = useState<string | null>(null)
  const [embedded, setEmbedded] = useState(false)

  useEffect(() => {
    const path = window.location.pathname
    const match = path.match(/\/share\/(.+)/)
    
    if (match) {
      setTrackId(match[1])
    }

    const params = new URLSearchParams(window.location.search)
    setEmbedded(params.get('embedded') === 'true')
  }, [])

  if (!trackId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <MusicNotes className="h-16 w-16 mx-auto text-muted-foreground" weight="fill" />
          <h2 className="text-2xl font-bold">Track Not Found</h2>
          <p className="text-muted-foreground">
            The track you're looking for doesn't exist or the link is invalid.
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <MusicNotes className="h-4 w-4" weight="fill" />
            Go to Eve Music Station
          </Button>
        </div>
      </div>
    )
  }

  if (embedded) {
    return (
      <div className="min-h-screen bg-background/95 flex items-center justify-center p-4">
        <ShareablePlayer trackId={trackId} embedded={true} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8 space-y-3">
          <div className="flex items-center justify-center gap-3">
            <MusicNotes className="h-10 w-10 text-accent animate-float" weight="fill" />
            <h1 className="text-3xl md:text-4xl font-bold glow-text">Eve Music Station</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Shared track from Eve's algorithmic music generation
          </p>
        </header>

        <ShareablePlayer trackId={trackId} embedded={false} />

        <div className="mt-8 text-center">
          <Button
            onClick={() => window.location.href = '/'}
            className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Create Your Own Music
          </Button>
        </div>

        <footer className="py-8 mt-12 text-center text-xs text-muted-foreground font-mono">
          <p>Built by @saint808 | Powered by Eve AI | φ = 1.618033988749</p>
          <p className="mt-1">Every track includes 808s and the golden ratio signature</p>
        </footer>
      </div>
    </div>
  )
}
