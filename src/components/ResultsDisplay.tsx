import { GenerationResult } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, DownloadSimple, Play, Pause } from '@phosphor-icons/react'
import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { downloadAudio } from '@/lib/elevenLabsService'

interface ResultsDisplayProps {
  result: GenerationResult
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const [copiedLyrics, setCopiedLyrics] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [result])

  const handleCopy = async (text: string, type: 'lyrics' | 'prompt') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'lyrics') {
        setCopiedLyrics(true)
        setTimeout(() => setCopiedLyrics(false), 2000)
      } else {
        setCopiedPrompt(true)
        setTimeout(() => setCopiedPrompt(false), 2000)
      }
      toast.success('Copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const handlePlayPause = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleDownload = () => {
    if (result.metadata?.audioBlob) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      const filename = `eve-music-${timestamp}.mp3`
      downloadAudio(result.metadata.audioBlob, filename)
      toast.success('Download started!')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!result.success) {
    return (
      <Card className="p-6 border-destructive/50 bg-destructive/10">
        <h3 className="text-lg font-bold text-destructive mb-2">Generation Failed</h3>
        <p className="text-sm text-destructive-foreground">{result.error || 'Unknown error occurred'}</p>
      </Card>
    )
  }

  if (result.mode === 'suno') {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="p-6 backdrop-cosmic border-accent/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold glow-text">Generated Lyrics</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => result.lyrics && handleCopy(result.lyrics, 'lyrics')}
              className="gap-2"
            >
              {copiedLyrics ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedLyrics ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <ScrollArea className="h-[300px] rounded-md bg-background/50 p-4">
            <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed">{result.lyrics}</pre>
          </ScrollArea>
        </Card>

        <Card className="p-6 backdrop-cosmic border-accent/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold glow-text">Style Prompt</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => result.stylePrompt && handleCopy(result.stylePrompt, 'prompt')}
              className="gap-2"
            >
              {copiedPrompt ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedPrompt ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <ScrollArea className="h-[200px] rounded-md bg-background/50 p-4">
            <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed">{result.stylePrompt}</pre>
          </ScrollArea>
        </Card>

        <Card className="p-4 bg-accent/10 border-accent/30">
          <p className="text-sm text-foreground/90">
            <strong>Next Steps:</strong> Copy both sections above and paste them into Suno.com to generate your track.
            The lyrics go in the custom lyrics field, and the style prompt goes in the style of music field.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {result.audioUrl && (
        <Card className="p-6 backdrop-cosmic border-accent/20">
          <h3 className="text-lg font-bold glow-text mb-4">Generated Audio</h3>
          
          <audio
            ref={audioRef}
            src={result.audioUrl}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                size="lg"
                onClick={handlePlayPause}
                className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
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

              <Button
                size="lg"
                variant="outline"
                onClick={handleDownload}
                className="gap-2"
              >
                <DownloadSimple className="h-5 w-5" weight="bold" />
                Download
              </Button>

              <div className="flex-1 text-right font-mono text-sm text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-accent transition-all duration-100"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 backdrop-cosmic border-accent/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold glow-text">Generation Prompt</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => result.generationPrompt && handleCopy(result.generationPrompt, 'prompt')}
            className="gap-2"
          >
            {copiedPrompt ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiedPrompt ? 'Copied!' : 'Copy'}
          </Button>
        </div>
        <ScrollArea className="h-[150px] rounded-md bg-background/50 p-4">
          <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed">{result.generationPrompt}</pre>
        </ScrollArea>
      </Card>

      {!result.audioUrl && (
        <Card className="p-4 bg-muted/30 border-border">
          <p className="text-sm text-muted-foreground">
            Prompt generated successfully. Audio generation was not triggered (prompt-only mode).
          </p>
        </Card>
      )}
    </div>
  )
}
