import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { MusicLibrary, LibraryTrack } from '@/lib/musicLibrary'
import { downloadAudio } from '@/lib/elevenLabsService'
import { Play, DownloadSimple, Trash, MusicNotes, Calendar, Clock, Sliders as SlidersIcon, Share } from '@phosphor-icons/react'
import { Badge } from './ui/badge'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { ShareModal } from './ShareModal'

interface MusicLibraryDisplayProps {
  onTrackAdded?: () => void
}

export function MusicLibraryDisplay({ onTrackAdded }: MusicLibraryDisplayProps) {
  const [tracks, setTracks] = useState<LibraryTrack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTrack, setSelectedTrack] = useState<LibraryTrack | null>(null)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
  const [shareTrack, setShareTrack] = useState<LibraryTrack | null>(null)

  useEffect(() => {
    loadTracks()
  }, [onTrackAdded])

  const loadTracks = async () => {
    setIsLoading(true)
    try {
      const libraryTracks = await MusicLibrary.getAll()
      setTracks(libraryTracks)
    } catch (error) {
      toast.error('Failed to load library')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (trackId: string) => {
    try {
      await MusicLibrary.remove(trackId)
      setTracks(tracks.filter(t => t.id !== trackId))
      toast.success('Track removed from library')
    } catch (error) {
      toast.error('Failed to remove track')
    }
  }

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear the entire library?')) return
    
    try {
      await MusicLibrary.clear()
      setTracks([])
      toast.success('Library cleared')
    } catch (error) {
      toast.error('Failed to clear library')
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <Card className="p-8 backdrop-cosmic border-accent/20">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" />
        </div>
      </Card>
    )
  }

  if (tracks.length === 0) {
    return (
      <Card className="p-12 backdrop-cosmic border-accent/20 text-center">
        <MusicNotes className="h-16 w-16 mx-auto mb-4 text-muted-foreground animate-float" weight="fill" />
        <h3 className="text-xl font-bold mb-2">No Tracks Yet</h3>
        <p className="text-muted-foreground">
          Your generated music will appear here. Start by generating your first track above!
        </p>
      </Card>
    )
  }

  return (
    <>
      <Card className="p-6 backdrop-cosmic border-accent/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MusicNotes className="h-6 w-6 text-accent" weight="fill" />
            <h2 className="text-2xl font-bold glow-text">Music Library</h2>
            <Badge variant="secondary" className="ml-2">
              {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
            </Badge>
          </div>
          {tracks.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearAll}
              className="gap-2"
            >
              <Trash className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {tracks.map((track) => (
              <Card
                key={track.id}
                className="p-4 bg-card/50 hover:bg-card/70 transition-colors cursor-pointer border-border/50"
                onClick={() => setSelectedTrack(track)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-2 truncate">
                      {track.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      {track.config.genres.slice(0, 3).map((genre) => (
                        <Badge key={genre} variant="outline" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {track.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(track.timestamp)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(track.timestamp)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MusicNotes className="h-3 w-3" weight="fill" />
                        {MusicLibrary.formatDuration(track.config.durationSeconds)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {track.result.audioUrl && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                          onClick={(e) => {
                            e.stopPropagation()
                            const audio = new Audio(track.result.audioUrl)
                            audio.play()
                            setPlayingTrackId(track.id)
                            audio.onended = () => setPlayingTrackId(null)
                          }}
                        >
                          <Play className="h-4 w-4" weight="fill" />
                          Play
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (track.result.metadata?.audioBlob) {
                              downloadAudio(track.result.metadata.audioBlob, `${track.title}.mp3`)
                              toast.success('Download started!')
                            } else if (track.result.audioUrl) {
                              fetch(track.result.audioUrl)
                                .then(res => res.blob())
                                .then(blob => {
                                  downloadAudio(blob, `${track.title}.mp3`)
                                  toast.success('Download started!')
                                })
                                .catch(() => {
                                  toast.error('Failed to download audio')
                                })
                            }
                          }}
                        >
                          <DownloadSimple className="h-4 w-4" weight="bold" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShareTrack(track)
                          }}
                          className="gap-2"
                        >
                          <Share className="h-4 w-4" weight="bold" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(track.id)
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {selectedTrack && (
        <Dialog open={!!selectedTrack} onOpenChange={() => setSelectedTrack(null)}>
          <DialogContent className="backdrop-cosmic max-w-2xl">
            <DialogHeader>
              <DialogTitle className="glow-text text-xl">
                {selectedTrack.title}
              </DialogTitle>
              <DialogDescription>
                Generated {formatDate(selectedTrack.timestamp)} at {formatTime(selectedTrack.timestamp)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <h4 className="font-semibold text-sm uppercase tracking-wide text-accent mb-2">
                  Genres
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTrack.config.genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm uppercase tracking-wide text-accent mb-2">
                  Description
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedTrack.description}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm uppercase tracking-wide text-accent mb-2 flex items-center gap-2">
                  <SlidersIcon className="h-4 w-4" />
                  Parameters
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-1">Weirdness</div>
                    <div className="text-lg font-semibold">{selectedTrack.config.weirdness}/100</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-1">Style</div>
                    <div className="text-lg font-semibold">{selectedTrack.config.style}/100</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-1">Audio Quality</div>
                    <div className="text-lg font-semibold">{selectedTrack.config.audio}/100</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-1">Duration</div>
                    <div className="text-lg font-semibold">
                      {MusicLibrary.formatDuration(selectedTrack.config.durationSeconds)}
                    </div>
                  </div>
                </div>
              </div>

              {selectedTrack.result.generationPrompt && (
                <div>
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-accent mb-2">
                    Generation Prompt
                  </h4>
                  <ScrollArea className="h-[120px] rounded-md bg-background/50 p-3">
                    <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed">
                      {selectedTrack.result.generationPrompt}
                    </pre>
                  </ScrollArea>
                </div>
              )}

              {selectedTrack.result.audioUrl && (
                <div className="flex gap-2">
                  <Button
                    className="flex-1 gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={() => {
                      const audio = new Audio(selectedTrack.result.audioUrl)
                      audio.play()
                    }}
                  >
                    <Play className="h-5 w-5" weight="fill" />
                    Play Track
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedTrack.result.metadata?.audioBlob) {
                        downloadAudio(selectedTrack.result.metadata.audioBlob, `${selectedTrack.title}.mp3`)
                        toast.success('Download started!')
                      } else if (selectedTrack.result.audioUrl) {
                        fetch(selectedTrack.result.audioUrl)
                          .then(res => res.blob())
                          .then(blob => {
                            downloadAudio(blob, `${selectedTrack.title}.mp3`)
                            toast.success('Download started!')
                          })
                          .catch(() => {
                            toast.error('Failed to download audio')
                          })
                      }
                    }}
                  >
                    <DownloadSimple className="h-5 w-5" weight="bold" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShareTrack(selectedTrack)
                      setSelectedTrack(null)
                    }}
                  >
                    <Share className="h-5 w-5" weight="bold" />
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <ShareModal
        track={shareTrack}
        open={!!shareTrack}
        onOpenChange={(open) => !open && setShareTrack(null)}
      />
    </>
  )
}
