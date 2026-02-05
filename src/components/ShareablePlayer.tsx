import { useEffect, useState, useRef } from 'react'
import { LibraryTrack, MusicLibrary } from '@/lib/musicLibrary'
import { downloadAudio } from '@/lib/elevenLabsService'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Play, 
  Pause, 
  DownloadSimple, 
  MusicNotes, 
  Calendar, 
  Clock,
  Sliders as SlidersIcon 
} from '@phosphor-icons/react'
import { Slider } from './ui/slider'
import { toast } from 'sonner'

interface ShareablePlayerProps {
  trackId: string
  embedded?: boolean
}

export function ShareablePlayer({ trackId, embedded = false }: ShareablePlayerProps) {
  const [track, setTrack] = useState<LibraryTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    loadTrack()
  }, [trackId])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const loadTrack = async () => {
    const loadedTrack = await MusicLibrary.getById(trackId)
    setTrack(loadedTrack)

    if (loadedTrack?.result.audioUrl) {
      const audio = new Audio(loadedTrack.result.audioUrl)
      audioRef.current = audio

      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration)
      })

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime)
      })

      audio.addEventListener('ended', () => {
        setIsPlaying(false)
        setCurrentTime(0)
      })
    }
  }

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return
    const newTime = value[0]
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (!track) {
    return (
      <Card className={`p-8 ${embedded ? 'bg-card/80 backdrop-blur-sm' : 'backdrop-cosmic border-accent/20'}`}>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" />
          <p className="text-muted-foreground text-sm">Loading track...</p>
        </div>
      </Card>
    )
  }

  if (!track.result.audioUrl) {
    return (
      <Card className={`p-8 ${embedded ? 'bg-card/80 backdrop-blur-sm' : 'backdrop-cosmic border-accent/20'}`}>
        <div className="flex flex-col items-center justify-center gap-4">
          <MusicNotes className="h-16 w-16 text-muted-foreground" weight="fill" />
          <p className="text-muted-foreground text-sm">This track has no audio available</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-6 ${embedded ? 'bg-card/90 backdrop-blur-md border-accent/30' : 'backdrop-cosmic border-accent/20'} ${embedded ? 'max-w-2xl mx-auto' : ''}`}>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MusicNotes className="h-8 w-8 text-accent animate-float" weight="fill" />
          </div>
          <h2 className={`font-bold ${embedded ? 'text-xl' : 'text-2xl'} glow-text`}>
            {track.title}
          </h2>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {track.config.genres.map((genre) => (
              <Badge key={genre} variant="outline" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>
          {!embedded && (
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(track.timestamp)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {MusicLibrary.formatDuration(track.config.durationSeconds)}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={togglePlayPause}
              className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground w-32 h-12"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-5 w-5" weight="fill" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" weight="fill" />
                  Play
                </>
              )}
            </Button>
            {!embedded && (
              <Button
                size="lg"
                variant="outline"
                onClick={async () => {
                  try {
                    if (track.result.metadata?.audioBlob) {
                      downloadAudio(track.result.metadata.audioBlob, `${track.title}.mp3`)
                      toast.success('Download started!')
                    } else if (track.result.audioUrl) {
                      const res = await fetch(track.result.audioUrl)
                      if (!res.ok) {
                        throw new Error('Failed to fetch audio')
                      }
                      const blob = await res.blob()
                      if (!blob || blob.size === 0) {
                        throw new Error('Invalid audio data')
                      }
                      downloadAudio(blob, `${track.title}.mp3`)
                      toast.success('Download started!')
                    } else {
                      toast.error('No audio available to download')
                    }
                  } catch (error) {
                    console.error('Download error:', error)
                    toast.error(error instanceof Error ? error.message : 'Failed to download audio')
                  }
                }}
                className="gap-2 h-12"
              >
                <DownloadSimple className="h-5 w-5" weight="bold" />
                Download
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {!embedded && track.description && (
          <div className="pt-4 border-t border-border/50">
            <h4 className="font-semibold text-sm uppercase tracking-wide text-accent mb-2">
              Description
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {track.description}
            </p>
          </div>
        )}

        {!embedded && (
          <div className="pt-4 border-t border-border/50">
            <h4 className="font-semibold text-sm uppercase tracking-wide text-accent mb-3 flex items-center gap-2">
              <SlidersIcon className="h-4 w-4" />
              Generation Parameters
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <div className="text-xs text-muted-foreground mb-1">Weirdness</div>
                <div className="text-lg font-semibold">{track.config.weirdness}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <div className="text-xs text-muted-foreground mb-1">Style</div>
                <div className="text-lg font-semibold">{track.config.style}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <div className="text-xs text-muted-foreground mb-1">Audio</div>
                <div className="text-lg font-semibold">{track.config.audio}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <div className="text-xs text-muted-foreground mb-1">Duration</div>
                <div className="text-lg font-semibold">
                  {MusicLibrary.formatDuration(track.config.durationSeconds)}
                </div>
              </div>
            </div>
          </div>
        )}

        {embedded && (
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Generated with{' '}
              <a 
                href={window.location.origin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:underline font-medium"
              >
                Eve Music Station
              </a>
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
