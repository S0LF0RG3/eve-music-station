import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { MusicConfig, GenerationMode, VoiceType, GenerationResult, AVAILABLE_GENRES } from './lib/types'
import { MusicGenerator } from './lib/musicGenerator'
import { AlgorithmicResonance } from './lib/algorithms'
import { Button } from './components/ui/button'
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs'
import { Card } from './components/ui/card'
import { Textarea } from './components/ui/textarea'
import { MusicNotes, Lightning, ArrowsClockwise, Sliders as SlidersIcon } from '@phosphor-icons/react'
import { GenreSelector } from './components/GenreSelector'
import { CosmicSlider } from './components/CosmicSlider'
import { AlgorithmDisplay } from './components/AlgorithmDisplay'
import { ResultsDisplay } from './components/ResultsDisplay'
import { toast } from 'sonner'
import { Toaster } from './components/ui/sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog'
import { ScrollArea } from './components/ui/scroll-area'

function App() {
  const [mode, setMode] = useKV<GenerationMode>('eve-music-mode', 'suno')
  const [genres, setGenres] = useKV<string[]>('eve-music-genres', [])
  const [description, setDescription] = useKV<string>('eve-music-description', '')
  const [voiceType, setVoiceType] = useKV<VoiceType>('eve-music-voice', 'instrumental')
  const [weirdness, setWeirdness] = useKV<number>('eve-music-weirdness', 50)
  const [style, setStyle] = useKV<number>('eve-music-style', 50)
  const [audio, setAudio] = useKV<number>('eve-music-audio', 50)
  const [duration, setDuration] = useKV<number>('eve-music-duration', 60)

  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [algorithms, setAlgorithms] = useState<ReturnType<AlgorithmicResonance['getActiveAlgorithms']>>([])
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysis, setAnalysis] = useState<{ weirdness: string; style: string; audio: string; overall: string } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isRecommending, setIsRecommending] = useState(false)

  const config: MusicConfig = {
    mode: mode ?? 'suno',
    genres: genres ?? [],
    description: description ?? '',
    voiceType: voiceType ?? 'instrumental',
    weirdness: weirdness ?? 50,
    style: style ?? 50,
    audio: audio ?? 50,
    durationSeconds: duration ?? 60,
  }

  useEffect(() => {
    if ((genres ?? []).length > 0) {
      const algo = new AlgorithmicResonance(config)
      setAlgorithms(algo.getActiveAlgorithms())
    } else {
      setAlgorithms([])
    }
  }, [genres, weirdness])

  const handleGenerate = async () => {
    if ((genres ?? []).length === 0) {
      toast.error('Please select at least one genre')
      return
    }

    if (!(description ?? '').trim()) {
      toast.warning('Consider adding a description for better results')
    }

    setIsGenerating(true)
    setResult(null)

    try {
      const generator = new MusicGenerator(config)
      const generationResult = await generator.generate()
      setResult(generationResult)

      if (generationResult.success) {
        toast.success(`${config.mode === 'suno' ? 'Suno export' : 'Music'} generated successfully!`)
      } else {
        toast.error(generationResult.error || 'Generation failed')
      }
    } catch (error) {
      toast.error('An error occurred during generation')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnalyze = async () => {
    if ((genres ?? []).length === 0) {
      toast.error('Please select at least one genre first')
      return
    }

    setIsAnalyzing(true)
    setShowAnalysis(true)

    try {
      const generator = new MusicGenerator(config)
      const analysisResult = await generator.analyzeSliders()
      setAnalysis(analysisResult)
    } catch (error) {
      toast.error('Analysis failed')
      setAnalysis(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleRecommend = async () => {
    if ((genres ?? []).length === 0) {
      toast.error('Please select at least one genre first')
      return
    }

    setIsRecommending(true)

    try {
      const generator = new MusicGenerator(config)
      const recommendations = await generator.recommendSliders()

      setWeirdness(recommendations.weirdness)
      setStyle(recommendations.style)
      setAudio(recommendations.audio)

      toast.success(recommendations.reasoning || 'Sliders adjusted based on your configuration')
    } catch (error) {
      toast.error('Failed to get recommendations')
    } finally {
      setIsRecommending(false)
    }
  }

  const handleToggleGenre = (genre: string) => {
    setGenres((currentGenres) => {
      const current = currentGenres ?? []
      if (current.includes(genre)) {
        return current.filter((g) => g !== genre)
      } else if (current.length < 4) {
        return [...current, genre]
      }
      return current
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8 md:mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <MusicNotes className="h-10 w-10 md:h-12 md:w-12 text-accent animate-float" weight="fill" />
            <h1 className="text-4xl md:text-5xl font-bold glow-text">Eve Music Station</h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Dual-mode agentic music generation powered by algorithmic mathematical precision.
            Generate Suno prompts or create music with the golden ratio signature.
          </p>
        </header>

        <div className="space-y-8">
          <Card className="p-6 backdrop-cosmic border-accent/20">
            <Tabs value={mode} onValueChange={(val) => setMode(val as GenerationMode)}>
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="suno" className="font-medium">
                  Suno Export
                </TabsTrigger>
                <TabsTrigger value="elevenlabs" className="font-medium">
                  ElevenLabs Generate
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm text-muted-foreground">
                {mode === 'suno' ? (
                  <>
                    <strong>Suno Mode:</strong> Generates lyrics and style prompts to copy into Suno.com.
                    Sliders are informational - they describe what to expect.
                  </>
                ) : (
                  <>
                    <strong>ElevenLabs Mode:</strong> Generates enhanced prompts for music creation.
                    Sliders functionally control the generation parameters.
                  </>
                )}
              </p>
            </div>
          </Card>

          <Card className="p-6 backdrop-cosmic border-accent/20">
            <GenreSelector
              genres={Array.from(AVAILABLE_GENRES)}
              selectedGenres={genres ?? []}
              onToggleGenre={handleToggleGenre}
              maxSelection={4}
            />
          </Card>

          <Card className="p-6 backdrop-cosmic border-accent/20">
            <div className="space-y-3">
              <label htmlFor="description" className="text-sm font-medium uppercase tracking-wide block">
                Description
              </label>
              <Textarea
                id="description"
                value={description ?? ''}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your desired sound, mood, energy, and creative vision..."
                className="min-h-[120px] resize-none bg-background/50 font-mono text-sm"
                maxLength={500}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Influences algorithmic selection and poetic essence</span>
                <span>{(description ?? '').length}/500</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 backdrop-cosmic border-accent/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <SlidersIcon className="h-5 w-5 text-accent" weight="bold" />
                <h3 className="text-sm font-medium uppercase tracking-wide">Generation Parameters</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAnalyze}
                  disabled={(genres ?? []).length === 0}
                  className="gap-2"
                >
                  <SlidersIcon className="h-4 w-4" />
                  What would this sound like?
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRecommend}
                  disabled={(genres ?? []).length === 0 || isRecommending}
                  className="gap-2"
                >
                  <ArrowsClockwise className="h-4 w-4" />
                  {isRecommending ? 'Thinking...' : 'Recommend levels'}
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <CosmicSlider
                label="Weirdness"
                value={weirdness ?? 50}
                onChange={setWeirdness}
                description={
                  (weirdness ?? 50) < 30
                    ? 'Conventional and structured patterns'
                    : (weirdness ?? 50) < 60
                    ? 'Moderately experimental with balance'
                    : 'Highly experimental and avant-garde'
                }
              />

              <CosmicSlider
                label="Style"
                value={style ?? 50}
                onChange={setStyle}
                description={
                  (style ?? 50) < 30
                    ? 'Loose genre interpretation, fusion elements'
                    : (style ?? 50) < 60
                    ? 'Clear genre identity with some crossover'
                    : 'Strict genre adherence, pure style'
                }
              />

              <CosmicSlider
                label="Audio"
                value={audio ?? 50}
                onChange={setAudio}
                description={
                  (audio ?? 50) < 30 ? 'Raw, lo-fi aesthetic' : (audio ?? 50) < 60 ? 'Balanced production' : 'Pristine, studio-grade polish'
                }
              />

              {mode === 'elevenlabs' && (
                <CosmicSlider
                  label="Duration (seconds)"
                  value={duration ?? 60}
                  onChange={setDuration}
                  min={10}
                  max={300}
                  step={5}
                  description="Track length for generation (10-300 seconds)"
                />
              )}
            </div>
          </Card>

          {algorithms.length > 0 && (
            <Card className="p-6 backdrop-cosmic border-accent/20">
              <AlgorithmDisplay algorithms={algorithms} />
            </Card>
          )}

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating || (genres ?? []).length === 0}
              className="gap-3 px-8 py-6 text-lg bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl shadow-accent/30 animate-pulse-glow"
            >
              <Lightning className="h-6 w-6" weight="fill" />
              {isGenerating
                ? 'Generating...'
                : mode === 'suno'
                ? 'Generate Suno Export'
                : 'Generate Music Prompt'}
            </Button>
          </div>

          {result && <ResultsDisplay result={result} />}
        </div>
      </div>

      <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
        <DialogContent className="backdrop-cosmic max-w-2xl">
          <DialogHeader>
            <DialogTitle className="glow-text">Slider Analysis</DialogTitle>
            <DialogDescription>
              Understanding what your current settings will produce in {mode === 'suno' ? 'Suno' : 'ElevenLabs'} mode
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[400px] mt-4">
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" />
              </div>
            ) : analysis ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm uppercase tracking-wide text-accent">Weirdness ({weirdness})</h4>
                  <p className="text-sm text-muted-foreground">{analysis.weirdness}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm uppercase tracking-wide text-accent">Style ({style})</h4>
                  <p className="text-sm text-muted-foreground">{analysis.style}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm uppercase tracking-wide text-accent">Audio ({audio})</h4>
                  <p className="text-sm text-muted-foreground">{analysis.audio}</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <h4 className="font-medium text-sm uppercase tracking-wide text-accent">Overall Sound</h4>
                  <p className="text-sm text-muted-foreground">{analysis.overall}</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Failed to analyze settings</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <footer className="py-8 mt-16 text-center text-xs text-muted-foreground font-mono">
        <p>Built by @saint808 | Powered by Eve AI | φ = 1.618033988749</p>
        <p className="mt-1">Every track includes 808s and the golden ratio signature</p>
      </footer>
    </div>
  )
}

export default App
