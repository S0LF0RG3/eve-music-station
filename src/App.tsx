import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { MusicConfig, GenerationMode, VoiceType, VocalStyle, GenerationResult, AVAILABLE_GENRES } from './lib/types'
import { MusicGenerator } from './lib/musicGenerator'
import { AlgorithmicResonance } from './lib/algorithms'
import { MusicLibrary } from './lib/musicLibrary'
import { Button } from './components/ui/button'
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs'
import { Card } from './components/ui/card'
import { Textarea } from './components/ui/textarea'
import { Input } from './components/ui/input'
import { MusicNotes, Lightning, ArrowsClockwise, Sliders as SlidersIcon, Sparkle, Shuffle, Key, Eye, EyeSlash, CheckCircle, Warning } from '@phosphor-icons/react'
import { GenreSelector } from './components/GenreSelector'
import { CosmicSlider } from './components/CosmicSlider'
import { AlgorithmDisplay } from './components/AlgorithmDisplay'
import { ResultsDisplay } from './components/ResultsDisplay'
import { VoiceSelector } from './components/VoiceSelector'
import { VocalStyleSelector } from './components/VocalStyleSelector'
import { VocalRecommendations } from './components/VocalRecommendations'
import { MusicLibraryDisplay } from './components/MusicLibrary'
import { SharePage } from './components/SharePage'
import { SunoAuthPanel } from './components/SunoAuthPanel'
import { PersonaSelector } from './components/PersonaSelector'
import { getBestVocalStyle, shouldSuggestVocalChange } from './lib/vocalRecommendations'
import { SunoAuthService } from './lib/sunoAuthService'
import { toast } from 'sonner'
import { Toaster } from './components/ui/sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog'
import { ScrollArea } from './components/ui/scroll-area'
import { Switch } from './components/ui/switch'
import { Label } from './components/ui/label'
import { setupApiRoutes } from './lib/apiHandler'

function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname)

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  if (currentRoute.startsWith('/share/')) {
    return <SharePage />
  }

  return <MainApp />
}

function MainApp() {
  const [mode, setMode] = useKV<GenerationMode>('eve-music-mode', 'suno')
  const [genres, setGenres] = useKV<string[]>('eve-music-genres', [])
  const [description, setDescription] = useKV<string>('eve-music-description', '')
  const [lyricsTheme, setLyricsTheme] = useKV<string>('eve-music-lyrics-theme', '')
  const [customLyrics, setCustomLyrics] = useKV<string>('eve-music-custom-lyrics', '')
  const [voiceType, setVoiceType] = useKV<VoiceType>('eve-music-voice', 'instrumental')
  const [vocalStyle, setVocalStyle] = useKV<VocalStyle>('eve-music-vocal-style', 'none')
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
  const [isEnhancingDescription, setIsEnhancingDescription] = useState(false)
  const [isEnhancingLyrics, setIsEnhancingLyrics] = useState(false)
  const [randomizeStyle, setRandomizeStyle] = useState(false)
  const [randomizeLyrics, setRandomizeLyrics] = useState(false)
  const [elevenLabsApiKey, setElevenLabsApiKey] = useKV<string>('elevenlabs-api-key', '')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isValidatingKey, setIsValidatingKey] = useState(false)
  const [keyValidation, setKeyValidation] = useState<'valid' | 'invalid' | null>(null)
  const [libraryRefresh, setLibraryRefresh] = useState(0)
  const [sunoAuthenticated, setSunoAuthenticated] = useState(false)
  const [selectedPersona, setSelectedPersona] = useKV<string>('eve-music-persona', '')
  const [createOnSuno, setCreateOnSuno] = useState(false)

  const config: MusicConfig = {
    mode: mode ?? 'suno',
    genres: genres ?? [],
    description: description ?? '',
    lyricsTheme: lyricsTheme ?? '',
    customLyrics: customLyrics ?? '',
    voiceType: voiceType ?? 'instrumental',
    vocalStyle: vocalStyle ?? 'none',
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

  useEffect(() => {
    if ((genres ?? []).length > 0 && voiceType !== 'instrumental' && vocalStyle !== 'none') {
      const suggestion = shouldSuggestVocalChange(vocalStyle ?? 'none', genres ?? [])
      
      if (suggestion.shouldSuggest && suggestion.suggestedStyle && suggestion.reason) {
        toast.info(suggestion.reason, {
          duration: 5000,
          action: {
            label: 'Apply',
            onClick: () => {
              if (suggestion.suggestedStyle) {
                setVocalStyle(suggestion.suggestedStyle)
                toast.success(`Vocal style changed to ${suggestion.suggestedStyle}`)
              }
            }
          }
        })
      }
    }
  }, [genres])

  useEffect(() => {
    setupApiRoutes()
  }, [])

  const validateApiKey = async (key: string) => {
    if (!key || key.length < 20) {
      setKeyValidation('invalid')
      return false
    }

    setIsValidatingKey(true)
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/user', {
        headers: {
          'xi-api-key': key,
        },
      })

      if (response.ok) {
        setKeyValidation('valid')
        toast.success('API key validated successfully!')
        return true
      } else {
        setKeyValidation('invalid')
        toast.error('Invalid API key')
        return false
      }
    } catch (error) {
      setKeyValidation('invalid')
      toast.error('Failed to validate API key')
      return false
    } finally {
      setIsValidatingKey(false)
    }
  }

  const handleGenerate = async () => {
    if ((genres ?? []).length === 0) {
      toast.error('Please select at least one genre')
      return
    }

    if (mode === 'elevenlabs' && !(elevenLabsApiKey ?? '').trim()) {
      toast.error('Please enter your ElevenLabs API key')
      return
    }

    if (mode === 'suno' && createOnSuno && !sunoAuthenticated) {
      toast.error('Please authenticate with Suno first')
      return
    }

    if (!(description ?? '').trim()) {
      toast.warning('Consider adding a description for better results')
    }

    setIsGenerating(true)
    setResult(null)

    try {
      const generator = new MusicGenerator(config)
      const generationResult = await generator.generate({ 
        randomizeStyle: randomizeStyle && mode === 'suno',
        randomizeLyrics: randomizeLyrics && mode === 'suno',
        elevenLabsApiKey: mode === 'elevenlabs' ? (elevenLabsApiKey ?? '') : undefined
      })
      setResult(generationResult)

      if (generationResult.success) {
        await MusicLibrary.add(config, generationResult)
        setLibraryRefresh(prev => prev + 1)

        // If in Suno mode and "Create on Suno" is enabled, submit to Suno
        if (mode === 'suno' && createOnSuno && sunoAuthenticated) {
          try {
            const songTitle = await generateSongTitle(generationResult)
            
            await SunoAuthService.createSong({
              lyrics: generationResult.lyrics,
              stylePrompt: generationResult.stylePrompt,
              genres: genres ?? [],
              persona: selectedPersona ?? undefined,
              weirdness: weirdness ?? 50,
              style: style ?? 50,
              audioQuality: audio ?? 50,
              songTitle
            })
            
            toast.success('Song created on Suno.com successfully!')
          } catch (sunoError) {
            console.error('Suno creation error:', sunoError)
            toast.error('Failed to create song on Suno, but export was saved to library')
          }
        }

        if (config.mode === 'elevenlabs' && generationResult.audioUrl) {
          toast.success('Music generated successfully! Saved to library.')
        } else {
          toast.success(`${config.mode === 'suno' ? 'Suno export' : 'Music prompt'} generated successfully! Saved to library.`)
        }
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

  const generateSongTitle = async (result: GenerationResult): Promise<string> => {
    try {
      const generator = new MusicGenerator(config)
      // Use LLM to generate a creative song title based on lyrics and style
      const titlePrompt = `Generate a creative, catchy song title (max 60 characters) for a ${genres?.join(', ')} song with these lyrics:\n\n${result.lyrics?.substring(0, 200)}...\n\nStyle: ${result.stylePrompt}\n\nReturn only the song title, nothing else.`
      
      // You'll need to implement this method in MusicGenerator or use direct LLM call
      // For now, return a simple title based on genres
      return `${genres?.[0] || 'Music'} Creation ${Date.now().toString().slice(-6)}`
    } catch (error) {
      console.error('Failed to generate song title:', error)
      return `Untitled ${Date.now().toString().slice(-6)}`
    }
  }

  const handleEnhanceDescription = async () => {
    if (!(description ?? '').trim()) {
      toast.error('Please enter a description first')
      return
    }

    setIsEnhancingDescription(true)

    try {
      const generator = new MusicGenerator(config)
      const enhanced = await generator.enhanceDescription(description ?? '')
      setDescription(enhanced)
      toast.success('Description enhanced!')
    } catch (error) {
      toast.error('Failed to enhance description')
    } finally {
      setIsEnhancingDescription(false)
    }
  }

  const handleEnhanceLyrics = async () => {
    if (!(customLyrics ?? '').trim() && !(lyricsTheme ?? '').trim()) {
      toast.error('Please enter lyrics or a theme first')
      return
    }

    setIsEnhancingLyrics(true)

    try {
      const generator = new MusicGenerator(config)
      const enhanced = await generator.enhanceLyrics(
        customLyrics ?? lyricsTheme ?? '', 
        lyricsTheme ?? undefined
      )
      setCustomLyrics(enhanced)
      toast.success('Lyrics enhanced!')
    } catch (error) {
      toast.error('Failed to enhance lyrics')
    } finally {
      setIsEnhancingLyrics(false)
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
                    <strong>ElevenLabs Mode:</strong> Generates complete music tracks using ElevenLabs Music Generation API.
                    Requires valid API key. Supports 3s-300s (5 minutes) duration. 
                    Vocals are generated automatically when vocal types are selected - the API handles vocal style through natural language prompts.
                    Sliders functionally control the generation parameters.
                  </>
                )}
              </p>
            </div>

            {mode === 'elevenlabs' && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-accent" weight="bold" />
                  <h3 className="text-sm font-medium uppercase tracking-wide">ElevenLabs API Key</h3>
                  {keyValidation === 'valid' && <CheckCircle className="h-5 w-5 text-green-500" weight="fill" />}
                  {keyValidation === 'invalid' && <Warning className="h-5 w-5 text-destructive" weight="fill" />}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="elevenlabs-api-key"
                      type={showApiKey ? 'text' : 'password'}
                      value={elevenLabsApiKey ?? ''}
                      onChange={(e) => {
                        setElevenLabsApiKey(e.target.value)
                        setKeyValidation(null)
                      }}
                      placeholder="Enter your ElevenLabs API key..."
                      className="bg-background/50 font-mono text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showApiKey ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => validateApiKey(elevenLabsApiKey ?? '')}
                    disabled={isValidatingKey || !(elevenLabsApiKey ?? '').trim()}
                    className="gap-2"
                  >
                    {isValidatingKey ? 'Validating...' : 'Validate'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from{' '}
                  <a
                    href="https://elevenlabs.io/app/settings/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    ElevenLabs Settings
                  </a>
                  . Your key is stored securely in your browser.
                </p>
              </div>
            )}
          </Card>

          {mode === 'suno' && (
            <>
              <SunoAuthPanel onAuthChange={setSunoAuthenticated} />
              
              {sunoAuthenticated && (
                <Card className="p-6 backdrop-cosmic border-accent/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MusicNotes className="h-5 w-5 text-accent" weight="fill" />
                      <h3 className="text-sm font-medium uppercase tracking-wide">Suno Direct Creation</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="create-on-suno"
                        checked={createOnSuno}
                        onCheckedChange={setCreateOnSuno}
                      />
                      <Label htmlFor="create-on-suno" className="text-sm cursor-pointer">
                        Auto-create on Suno.com
                      </Label>
                    </div>
                  </div>

                  {createOnSuno && (
                    <>
                      <p className="text-xs text-muted-foreground">
                        When enabled, songs will be automatically created on Suno.com after generation.
                      </p>
                      
                      <PersonaSelector
                        value={selectedPersona ?? ''}
                        onChange={setSelectedPersona}
                        disabled={!sunoAuthenticated}
                      />
                    </>
                  )}
                </Card>
              )}
            </>
          )}

          <Card className="p-6 backdrop-cosmic border-accent/20">
            <GenreSelector
              genres={Array.from(AVAILABLE_GENRES)}
              selectedGenres={genres ?? []}
              onToggleGenre={handleToggleGenre}
              maxSelection={4}
            />
          </Card>

          {mode === 'suno' && (
            <Card className="p-6 backdrop-cosmic border-accent/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MusicNotes className="h-5 w-5 text-accent" weight="fill" />
                  <h3 className="text-sm font-medium uppercase tracking-wide">Lyrics & Voice</h3>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium block">Voice Type</label>
                <VoiceSelector value={voiceType ?? 'instrumental'} onChange={setVoiceType} />
              </div>

              {voiceType !== 'instrumental' && (
                <>
                  <VocalStyleSelector 
                    value={vocalStyle ?? 'none'} 
                    onChange={setVocalStyle}
                    genres={genres ?? []}
                  />

                  {(genres ?? []).length > 0 && vocalStyle !== 'none' && (
                    <VocalRecommendations
                      genres={genres ?? []}
                      currentStyle={vocalStyle ?? 'none'}
                      onSelectStyle={setVocalStyle}
                    />
                  )}

                  <div className="space-y-3">
                    <label htmlFor="lyrics-theme" className="text-sm font-medium block">
                      Theme or Concept (Optional)
                    </label>
                    <Textarea
                      id="lyrics-theme"
                      value={lyricsTheme ?? ''}
                      onChange={(e) => setLyricsTheme(e.target.value)}
                      placeholder="e.g., heartbreak in the city, cosmic journey, rebellion..."
                      className="min-h-[60px] resize-none bg-background/50 font-mono text-sm"
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground">{(lyricsTheme ?? '').length}/200 - Guides lyric generation</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label htmlFor="custom-lyrics" className="text-sm font-medium block">
                        Custom Lyrics (Optional)
                      </label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleEnhanceLyrics}
                        disabled={isEnhancingLyrics || (!(customLyrics ?? '').trim() && !(lyricsTheme ?? '').trim())}
                        className="gap-2 h-7"
                      >
                        <Sparkle className="h-3 w-3" />
                        {isEnhancingLyrics ? 'Enhancing...' : 'Enhance'}
                      </Button>
                    </div>
                    <Textarea
                      id="custom-lyrics"
                      value={customLyrics ?? ''}
                      onChange={(e) => setCustomLyrics(e.target.value)}
                      placeholder="Write your own lyrics or let Eve generate them. You can also write ideas and enhance them with the button above..."
                      className="min-h-[150px] resize-none bg-background/50 font-mono text-sm"
                      maxLength={2000}
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        {(customLyrics ?? '').length}/2000 - Leave blank to auto-generate
                      </p>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="randomize-lyrics"
                          checked={randomizeLyrics}
                          onCheckedChange={setRandomizeLyrics}
                        />
                        <Label htmlFor="randomize-lyrics" className="text-xs cursor-pointer">
                          Randomize on generate
                        </Label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>
          )}

          <Card className="p-6 backdrop-cosmic border-accent/20">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="description" className="text-sm font-medium uppercase tracking-wide block">
                  Description
                </label>
                {mode === 'suno' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleEnhanceDescription}
                    disabled={isEnhancingDescription || !(description ?? '').trim()}
                    className="gap-2 h-7"
                  >
                    <Sparkle className="h-3 w-3" />
                    {isEnhancingDescription ? 'Enhancing...' : 'Enhance'}
                  </Button>
                )}
              </div>
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

              <CosmicSlider
                label="Duration (seconds)"
                value={duration ?? 60}
                onChange={setDuration}
                min={mode === 'elevenlabs' ? 3 : 30}
                max={300}
                step={mode === 'elevenlabs' ? 1 : 10}
                description={`${duration ?? 60}s - ${
                  (duration ?? 60) < 60
                    ? 'Short format'
                    : (duration ?? 60) < 120
                    ? 'Standard length'
                    : (duration ?? 60) < 180
                    ? 'Long format'
                    : 'Extended format'
                }`}
              />

              {mode === 'elevenlabs' && (
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/30 text-xs text-foreground/90">
                  <strong>ElevenLabs Music Generation API:</strong> Supports 3 seconds to 5 minutes (300s). Currently set to {Math.min(Math.max(duration ?? 60, 3), 300)}s.
                </div>
              )}
            </div>

            {mode === 'suno' && (
              <div className="mt-6 flex items-center justify-end gap-2">
                <Switch
                  id="randomize-style"
                  checked={randomizeStyle}
                  onCheckedChange={setRandomizeStyle}
                />
                <Label htmlFor="randomize-style" className="text-sm cursor-pointer flex items-center gap-2">
                  <Shuffle className="h-4 w-4" />
                  Randomize style prompt
                </Label>
              </div>
            )}
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
                : 'Generate Music'}
            </Button>
          </div>

          {result && <ResultsDisplay result={result} />}

          <div id="library" className="scroll-mt-8">
            <MusicLibraryDisplay key={libraryRefresh} />
          </div>
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
