import { VocalStyle } from './types'

interface VocalRecommendation {
  style: VocalStyle
  confidence: number
  reasoning: string
}

interface GenreVocalMapping {
  primary: VocalStyle[]
  secondary: VocalStyle[]
  avoid?: VocalStyle[]
}

const GENRE_VOCAL_MAP: Record<string, GenreVocalMapping> = {
  'Trap': {
    primary: ['rap', 'auto-tuned', 'melodic'],
    secondary: ['aggressive', 'soft', 'breathy'],
    avoid: ['operatic', 'choir', 'death-metal']
  },
  'Hip-Hop': {
    primary: ['rap', 'aggressive', 'melodic'],
    secondary: ['raspy', 'powerful', 'spoken-word'],
    avoid: ['operatic', 'death-metal', 'scream']
  },
  'EDM': {
    primary: ['auto-tuned', 'powerful', 'melodic'],
    secondary: ['soft', 'breathy', 'harmonized'],
    avoid: ['growl', 'death-metal', 'guttural']
  },
  'House': {
    primary: ['melodic', 'soft', 'powerful'],
    secondary: ['breathy', 'harmonized', 'auto-tuned'],
    avoid: ['growl', 'death-metal', 'scream']
  },
  'Techno': {
    primary: ['auto-tuned', 'whispered', 'spoken-word'],
    secondary: ['aggressive', 'melodic', 'powerful'],
    avoid: ['operatic', 'death-metal']
  },
  'Dubstep': {
    primary: ['aggressive', 'auto-tuned', 'powerful'],
    secondary: ['raspy', 'scream', 'melodic'],
    avoid: ['operatic', 'soft', 'breathy']
  },
  'Drum and Bass': {
    primary: ['aggressive', 'rap', 'powerful'],
    secondary: ['melodic', 'raspy', 'auto-tuned'],
    avoid: ['operatic', 'soft']
  },
  'Trance': {
    primary: ['melodic', 'powerful', 'soft'],
    secondary: ['breathy', 'harmonized', 'auto-tuned'],
    avoid: ['growl', 'death-metal', 'guttural']
  },
  'Ambient': {
    primary: ['whispered', 'soft', 'breathy'],
    secondary: ['melodic', 'harmonized', 'choir'],
    avoid: ['aggressive', 'scream', 'death-metal', 'rap']
  },
  'Downtempo': {
    primary: ['soft', 'breathy', 'melodic'],
    secondary: ['whispered', 'harmonized', 'spoken-word'],
    avoid: ['aggressive', 'scream', 'death-metal']
  },
  'Industrial': {
    primary: ['aggressive', 'growl', 'raspy'],
    secondary: ['powerful', 'guttural', 'scream'],
    avoid: ['soft', 'breathy', 'operatic']
  },
  'Nu-Metal': {
    primary: ['aggressive', 'raspy', 'scream'],
    secondary: ['growl', 'rap', 'powerful'],
    avoid: ['soft', 'breathy', 'whispered']
  },
  'Glitchcore': {
    primary: ['auto-tuned', 'aggressive', 'scream'],
    secondary: ['rap', 'whispered', 'spoken-word'],
    avoid: ['operatic', 'soft']
  },
  'Ritualcore': {
    primary: ['whispered', 'choir', 'guttural'],
    secondary: ['spoken-word', 'powerful', 'harmonized'],
    avoid: ['rap', 'auto-tuned']
  },
  'Pop': {
    primary: ['melodic', 'soft', 'powerful'],
    secondary: ['breathy', 'harmonized', 'falsetto'],
    avoid: ['growl', 'death-metal', 'guttural']
  },
  'Rock': {
    primary: ['powerful', 'raspy', 'melodic'],
    secondary: ['aggressive', 'falsetto', 'harmonized'],
    avoid: ['whispered', 'auto-tuned']
  },
  'Metal': {
    primary: ['growl', 'scream', 'aggressive'],
    secondary: ['guttural', 'powerful', 'raspy'],
    avoid: ['soft', 'breathy', 'whispered', 'auto-tuned']
  },
  'Jazz': {
    primary: ['soft', 'breathy', 'melodic'],
    secondary: ['raspy', 'powerful', 'whispered'],
    avoid: ['scream', 'death-metal', 'auto-tuned']
  },
  'Classical': {
    primary: ['operatic', 'choir', 'melodic'],
    secondary: ['powerful', 'soft', 'harmonized'],
    avoid: ['rap', 'scream', 'death-metal', 'auto-tuned']
  },
  'Funk': {
    primary: ['powerful', 'melodic', 'raspy'],
    secondary: ['falsetto', 'harmonized', 'soft'],
    avoid: ['death-metal', 'scream', 'whispered']
  },
  'Soul': {
    primary: ['powerful', 'melodic', 'soft'],
    secondary: ['raspy', 'breathy', 'falsetto'],
    avoid: ['scream', 'death-metal', 'guttural']
  },
  'R&B': {
    primary: ['melodic', 'soft', 'breathy'],
    secondary: ['powerful', 'falsetto', 'harmonized'],
    avoid: ['scream', 'death-metal', 'growl']
  },
  'Reggae': {
    primary: ['melodic', 'soft', 'raspy'],
    secondary: ['spoken-word', 'harmonized', 'powerful'],
    avoid: ['scream', 'death-metal', 'operatic']
  },
  'Country': {
    primary: ['melodic', 'raspy', 'soft'],
    secondary: ['powerful', 'breathy', 'spoken-word'],
    avoid: ['scream', 'death-metal', 'auto-tuned']
  },
  'Folk': {
    primary: ['soft', 'melodic', 'breathy'],
    secondary: ['whispered', 'harmonized', 'spoken-word'],
    avoid: ['scream', 'death-metal', 'auto-tuned', 'aggressive']
  },
  'Blues': {
    primary: ['raspy', 'powerful', 'melodic'],
    secondary: ['soft', 'breathy', 'guttural'],
    avoid: ['auto-tuned', 'scream', 'operatic']
  },
  'Punk': {
    primary: ['aggressive', 'raspy', 'scream'],
    secondary: ['powerful', 'melodic', 'spoken-word'],
    avoid: ['soft', 'breathy', 'operatic', 'auto-tuned']
  },
  'Hardcore': {
    primary: ['scream', 'aggressive', 'growl'],
    secondary: ['powerful', 'guttural', 'raspy'],
    avoid: ['soft', 'breathy', 'whispered', 'melodic']
  },
  'Breakbeat': {
    primary: ['rap', 'aggressive', 'melodic'],
    secondary: ['powerful', 'spoken-word', 'auto-tuned'],
    avoid: ['operatic', 'death-metal']
  },
  'Jungle': {
    primary: ['rap', 'aggressive', 'melodic'],
    secondary: ['raspy', 'powerful', 'spoken-word'],
    avoid: ['operatic', 'soft', 'whispered']
  },
  'Lo-Fi': {
    primary: ['soft', 'breathy', 'whispered'],
    secondary: ['melodic', 'spoken-word', 'harmonized'],
    avoid: ['scream', 'death-metal', 'aggressive']
  },
  'Vaporwave': {
    primary: ['auto-tuned', 'soft', 'melodic'],
    secondary: ['breathy', 'whispered', 'harmonized'],
    avoid: ['scream', 'death-metal', 'aggressive']
  },
  'Synthwave': {
    primary: ['auto-tuned', 'melodic', 'powerful'],
    secondary: ['soft', 'harmonized', 'breathy'],
    avoid: ['growl', 'death-metal', 'scream']
  },
  'Darkwave': {
    primary: ['whispered', 'soft', 'melodic'],
    secondary: ['breathy', 'harmonized', 'spoken-word'],
    avoid: ['rap', 'scream', 'death-metal']
  },
  'Post-Rock': {
    primary: ['soft', 'melodic', 'whispered'],
    secondary: ['breathy', 'harmonized', 'powerful'],
    avoid: ['rap', 'scream', 'death-metal']
  },
  'Math Rock': {
    primary: ['melodic', 'aggressive', 'powerful'],
    secondary: ['raspy', 'harmonized', 'soft'],
    avoid: ['death-metal', 'rap']
  },
  'Progressive': {
    primary: ['powerful', 'melodic', 'operatic'],
    secondary: ['harmonized', 'falsetto', 'aggressive'],
    avoid: ['whispered', 'rap']
  },
  'Experimental': {
    primary: ['whispered', 'spoken-word', 'auto-tuned'],
    secondary: ['aggressive', 'guttural', 'harmonized'],
  },
  'Noise': {
    primary: ['scream', 'guttural', 'aggressive'],
    secondary: ['growl', 'whispered', 'spoken-word'],
    avoid: ['melodic', 'soft', 'breathy']
  },
  'Minimal': {
    primary: ['whispered', 'soft', 'breathy'],
    secondary: ['melodic', 'spoken-word', 'harmonized'],
    avoid: ['scream', 'death-metal', 'aggressive']
  },
  'Deep House': {
    primary: ['soft', 'melodic', 'breathy'],
    secondary: ['whispered', 'harmonized', 'powerful'],
    avoid: ['scream', 'death-metal', 'growl']
  },
  'Tech House': {
    primary: ['melodic', 'auto-tuned', 'powerful'],
    secondary: ['aggressive', 'spoken-word', 'harmonized'],
    avoid: ['operatic', 'death-metal']
  },
  'Bass Music': {
    primary: ['aggressive', 'powerful', 'auto-tuned'],
    secondary: ['rap', 'melodic', 'raspy'],
    avoid: ['soft', 'whispered', 'operatic']
  },
}

export function getVocalRecommendations(genres: string[]): VocalRecommendation[] {
  if (genres.length === 0) {
    return []
  }

  const styleScores = new Map<VocalStyle, { score: number; reasons: string[] }>()

  genres.forEach((genre) => {
    const mapping = GENRE_VOCAL_MAP[genre]
    if (!mapping) return

    mapping.primary.forEach((style) => {
      const current = styleScores.get(style) || { score: 0, reasons: [] }
      current.score += 3
      current.reasons.push(`Perfect for ${genre}`)
      styleScores.set(style, current)
    })

    mapping.secondary.forEach((style) => {
      const current = styleScores.get(style) || { score: 0, reasons: [] }
      current.score += 1.5
      current.reasons.push(`Works well with ${genre}`)
      styleScores.set(style, current)
    })

    mapping.avoid?.forEach((style) => {
      const current = styleScores.get(style) || { score: 0, reasons: [] }
      current.score -= 2
      current.reasons.push(`Typically not used in ${genre}`)
      styleScores.set(style, current)
    })
  })

  const recommendations: VocalRecommendation[] = Array.from(styleScores.entries())
    .filter(([_, data]) => data.score > 0)
    .map(([style, data]) => ({
      style,
      confidence: Math.min(100, Math.round((data.score / (genres.length * 3)) * 100)),
      reasoning: data.reasons.slice(0, 2).join('. '),
    }))
    .sort((a, b) => b.confidence - a.confidence)

  return recommendations.slice(0, 5)
}

export function getBestVocalStyle(genres: string[]): VocalStyle | null {
  const recommendations = getVocalRecommendations(genres)
  return recommendations.length > 0 ? recommendations[0].style : null
}

export function shouldSuggestVocalChange(
  currentStyle: VocalStyle,
  genres: string[]
): { shouldSuggest: boolean; suggestedStyle?: VocalStyle; reason?: string } {
  if (currentStyle === 'none' || genres.length === 0) {
    return { shouldSuggest: false }
  }

  const recommendations = getVocalRecommendations(genres)
  
  const currentStyleInRecommendations = recommendations.find(r => r.style === currentStyle)
  
  if (!currentStyleInRecommendations && recommendations.length > 0) {
    return {
      shouldSuggest: true,
      suggestedStyle: recommendations[0].style,
      reason: `${recommendations[0].style} is more suitable for ${genres.join(', ')} (${recommendations[0].confidence}% match)`
    }
  }

  if (currentStyleInRecommendations && currentStyleInRecommendations.confidence < 30 && recommendations.length > 0) {
    return {
      shouldSuggest: true,
      suggestedStyle: recommendations[0].style,
      reason: `Consider switching to ${recommendations[0].style} for better genre compatibility`
    }
  }

  return { shouldSuggest: false }
}
