import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface CosmicSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  description?: string
}

export function CosmicSlider({ label, value, onChange, min = 0, max = 100, step = 1, description }: CosmicSliderProps) {
  const getIntensityColor = () => {
    const percent = value / max
    if (percent < 0.33) return 'from-secondary to-muted'
    if (percent < 0.67) return 'from-primary to-accent/50'
    return 'from-accent to-primary'
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium uppercase tracking-wide">{label}</label>
        <span className="text-xl font-bold font-mono tabular-nums glow-text">{value}</span>
      </div>

      <div className="relative group">
        <Slider
          value={[value]}
          onValueChange={(vals) => onChange(vals[0])}
          min={min}
          max={max}
          step={step}
          className={cn('relative')}
        />
        
        <div
          className={cn(
            'absolute top-1/2 left-0 h-1 rounded-full bg-gradient-to-r transition-all duration-300 pointer-events-none -translate-y-1/2',
            getIntensityColor()
          )}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>

      {description && (
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      )}
    </div>
  )
}
