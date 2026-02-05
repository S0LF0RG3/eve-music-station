import { GenerationResult } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ResultsDisplayProps {
  result: GenerationResult
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const [copiedLyrics, setCopiedLyrics] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)

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
      <Card className="p-6 backdrop-cosmic border-accent/20">
        <h3 className="text-lg font-bold glow-text mb-3">Generation Prompt</h3>
        <ScrollArea className="h-[150px] rounded-md bg-background/50 p-4">
          <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed">{result.generationPrompt}</pre>
        </ScrollArea>
      </Card>

      <Card className="p-4 bg-accent/10 border-accent/30">
        <p className="text-sm text-foreground/90">
          <strong>Note:</strong> This is a demo mode. In production, this would generate actual music via ElevenLabs API
          and provide an audio player with download functionality. Duration: {result.durationMs ? result.durationMs / 1000 : 0}s
        </p>
      </Card>
    </div>
  )
}
