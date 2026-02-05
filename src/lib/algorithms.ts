import { MusicConfig, AlgorithmInfo, PHI } from './types'

export class AlgorithmicResonance {
  private config: MusicConfig
  private fibonacci: number[]
  private primes: number[]
  private activeAlgorithms: string[]

  constructor(config: MusicConfig) {
    this.config = config
    this.fibonacci = this.generateFibonacci(20)
    this.primes = this.generatePrimes(50)
    this.activeAlgorithms = this.selectAlgorithms()
  }

  private generateFibonacci(count: number): number[] {
    const fib = [1, 1]
    for (let i = 0; i < count - 2; i++) {
      fib.push(fib[fib.length - 1] + fib[fib.length - 2])
    }
    return fib
  }

  private generatePrimes(maxNum: number): number[] {
    const primes: number[] = []
    for (let num = 2; num < maxNum; num++) {
      let isPrime = true
      for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) {
          isPrime = false
          break
        }
      }
      if (isPrime) primes.push(num)
    }
    return primes
  }

  private selectAlgorithms(): string[] {
    const algorithms: string[] = []
    const genreLower = this.config.genres.map(g => g.toLowerCase())
    const weirdness = this.config.weirdness

    algorithms.push('fibonacci')

    if (weirdness > 40 || genreLower.some(g => ['trap', 'industrial'].includes(g))) {
      algorithms.push('golden_ratio')
    }

    if (genreLower.some(g => ['trap', 'hip-hop', 'ambient'].includes(g))) {
      algorithms.push('perlin')
    }

    if (genreLower.some(g => ['trap', 'drum and bass', 'glitchcore'].includes(g))) {
      algorithms.push('particle')
    }

    if (weirdness > 50) {
      algorithms.push('prime')
    }

    if (weirdness > 60 || genreLower.some(g => ['glitchcore', 'experimental'].includes(g))) {
      algorithms.push('fractal')
    }

    if (weirdness > 70) {
      algorithms.push('chaos')
    }

    if (genreLower.some(g => ['ambient', 'atmospheric', 'experimental'].includes(g))) {
      algorithms.push('flow_field')
    }

    if (algorithms.length > 4) {
      const keep = ['fibonacci', 'golden_ratio']
      const others = algorithms.filter(a => !keep.includes(a))
      const shuffled = others.sort(() => Math.random() - 0.5)
      return [...keep, ...shuffled.slice(0, 2)]
    }

    return algorithms
  }

  getActiveAlgorithms(): AlgorithmInfo[] {
    return this.activeAlgorithms.map(algo => ({
      id: algo,
      name: this.getAlgorithmName(algo),
      description: this.getAlgorithmDescription(algo),
      formula: this.getAlgorithmFormula(algo),
      active: true,
    }))
  }

  private getAlgorithmName(algo: string): string {
    const names: Record<string, string> = {
      fibonacci: 'Fibonacci Sequence',
      golden_ratio: 'Golden Ratio (φ)',
      perlin: 'Perlin Noise',
      particle: 'Particle Systems',
      prime: 'Prime Numbers',
      fractal: 'Fractal Recursion',
      chaos: 'Chaos Theory',
      flow_field: 'Flow Fields',
    }
    return names[algo] || algo
  }

  private getAlgorithmDescription(algo: string): string {
    const descriptions: Record<string, string> = {
      fibonacci: 'Natural harmonic intervals',
      golden_ratio: 'φ-modulated tempo and structure',
      perlin: 'Organic rhythmic variation',
      particle: 'Velocity-mapped percussion dynamics',
      prime: 'Polyrhythmic complexity',
      fractal: 'Self-similar melodic patterns',
      chaos: 'Controlled mathematical randomness',
      flow_field: 'Vector-guided spatial movement',
    }
    return descriptions[algo] || ''
  }

  private getAlgorithmFormula(algo: string): string {
    switch (algo) {
      case 'fibonacci':
        return this.fibonacci.slice(0, 8).join(':')
      case 'golden_ratio':
        return `φ = ${PHI.toFixed(3)}`
      case 'perlin':
        return `octaves: ${2 + Math.floor(this.config.weirdness / 25)}`
      case 'particle':
        return `count: ${20 + Math.floor((this.config.weirdness * 80) / 100)}`
      case 'prime': {
        const maxPrime = 7 + Math.floor((this.config.weirdness * 20) / 100)
        const activePrimes = this.primes.filter(p => p <= maxPrime).slice(0, 5)
        return activePrimes.join(':')
      }
      case 'fractal':
        return `depth: ${2 + Math.floor((this.config.weirdness * 4) / 100)}`
      case 'chaos':
        return `sensitivity: ${(0.5 + (this.config.weirdness * 0.5) / 100).toFixed(2)}`
      case 'flow_field':
        return 'resolution: 20'
      default:
        return ''
    }
  }

  getBpmModulation(baseBpm: number): string | null {
    if (!this.activeAlgorithms.includes('golden_ratio')) return null
    const phiBpm = Math.round(baseBpm * PHI)
    const phi2Bpm = Math.round(baseBpm * PHI * PHI)
    return `${baseBpm} (φ-modulated: ${baseBpm}→${phiBpm}→${phi2Bpm})`
  }

  getFormulasForPrompt(): string {
    return this.activeAlgorithms
      .map(algo => this.getFullAlgorithmFormula(algo))
      .filter(Boolean)
      .join('\n')
  }

  private getFullAlgorithmFormula(algo: string): string {
    switch (algo) {
      case 'fibonacci':
        return `Fibonacci harmonic progression (${this.fibonacci.slice(0, 8).join(':')})`
      case 'golden_ratio':
        return `φ-modulated tempo and structural proportions (φ = ${PHI.toFixed(3)})`
      case 'perlin': {
        const seed = this.getPerlinSeed()
        const octaves = 2 + Math.floor(this.config.weirdness / 25)
        return `Perlin noise rhythm variation (seed: ${seed}, octaves: ${octaves})`
      }
      case 'particle': {
        const count = 20 + Math.floor((this.config.weirdness * 80) / 100)
        return `Particle system percussion (${count} particles, velocity-mapped dynamics)`
      }
      case 'prime': {
        const maxPrime = 7 + Math.floor((this.config.weirdness * 20) / 100)
        const activePrimes = this.primes.filter(p => p <= maxPrime).slice(0, 5)
        return `Prime number polyrhythms (${activePrimes.join(':')})`
      }
      case 'fractal': {
        const depth = 2 + Math.floor((this.config.weirdness * 4) / 100)
        return `Fractal melodic recursion (depth: ${depth}, self-similar patterns)`
      }
      case 'chaos': {
        const sensitivity = (0.5 + (this.config.weirdness * 0.5) / 100).toFixed(2)
        return `Chaos theory modulation (sensitivity: ${sensitivity})`
      }
      case 'flow_field':
        return 'Flow field audio panning, vector-guided spatial movement'
      default:
        return ''
    }
  }

  getElevenLabsDescription(): string {
    const descriptions = this.activeAlgorithms
      .map(algo => this.getAlgorithmElevenLabsDesc(algo))
      .filter(Boolean)

    if (descriptions.length === 0) return ''
    return 'Incorporating ' + descriptions.join(', ') + ' for mathematical resonance'
  }

  private getAlgorithmElevenLabsDesc(algo: string): string {
    const descs: Record<string, string> = {
      fibonacci: 'Fibonacci-based harmonic intervals',
      golden_ratio: 'golden ratio tempo modulation',
      perlin: 'organic rhythmic variation from Perlin noise',
      particle: 'particle system percussion dynamics',
      prime: 'prime number polyrhythmic structures',
      fractal: 'fractal melodic recursion',
      chaos: 'controlled chaos patterns',
      flow_field: 'flow field spatial panning',
    }
    return descs[algo] || ''
  }

  getPoeticEssence(): string {
    const essences: string[] = []

    if (this.activeAlgorithms.includes('fibonacci')) {
      essences.push('spiraling through natural mathematical sequences')
    }
    if (this.activeAlgorithms.includes('golden_ratio')) {
      essences.push('proportioned by golden ratio beauty')
    }
    if (this.activeAlgorithms.includes('chaos')) {
      essences.push('embracing controlled mathematical chaos')
    }
    if (this.activeAlgorithms.includes('fractal')) {
      essences.push('recursing through self-similar sonic structures')
    }
    if (this.activeAlgorithms.includes('prime')) {
      essences.push('interlocking prime number rhythms')
    }

    if (essences.length > 0) {
      return essences.slice(0, 2).join(', ')
    }

    return 'mathematically precise yet organically flowing'
  }

  private getPerlinSeed(): number {
    const hash = this.simpleHash(this.config.description)
    return hash % 100000
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }
}
