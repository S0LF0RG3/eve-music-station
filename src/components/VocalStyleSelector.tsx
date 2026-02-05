import { VocalStyle } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Microphone } from '@phosphor-icons/react'

interface VocalStyleSelectorProps {
  value: VocalStyle
  onChange: (style: VocalStyle) => void
  disabled?: boolean
}

const VOCAL_STYLES: { value: VocalStyle; label: string; description: string }[] = [
  { value: 'none', label: 'None', description: 'No specific vocal style' },
  { value: 'soft', label: 'Soft', description: 'Gentle, intimate vocals' },
  { value: 'powerful', label: 'Powerful', description: 'Strong, commanding vocals' },
  { value: 'raspy', label: 'Raspy', description: 'Rough, textured vocals' },
  { value: 'breathy', label: 'Breathy', description: 'Airy, whisper-like vocals' },
  { value: 'operatic', label: 'Operatic', description: 'Classical, dramatic vocals' },
  { value: 'rap', label: 'Rap', description: 'Rhythmic, spoken vocals' },
  { value: 'spoken-word', label: 'Spoken Word', description: 'Narrative, poetic delivery' },
  { value: 'whispered', label: 'Whispered', description: 'Intimate, hushed vocals' },
  { value: 'choir', label: 'Choir', description: 'Multiple layered voices' },
  { value: 'harmonized', label: 'Harmonized', description: 'Layered vocal harmonies' },
  { value: 'auto-tuned', label: 'Auto-Tuned', description: 'Processed, robotic effect' },
  { value: 'growl', label: 'Growl', description: 'Deep, throaty metal vocals' },
  { value: 'falsetto', label: 'Falsetto', description: 'High, head voice technique' },
  { value: 'death-metal', label: 'Death Metal', description: 'Extreme guttural growls' },
  { value: 'scream', label: 'Scream', description: 'High-pitched aggressive vocals' },
  { value: 'guttural', label: 'Guttural', description: 'Deep, primal throat vocals' },
  { value: 'melodic', label: 'Melodic', description: 'Clear, tuneful vocals' },
  { value: 'aggressive', label: 'Aggressive', description: 'Intense, forceful delivery' },
]

export function VocalStyleSelector({ value, onChange, disabled }: VocalStyleSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Microphone className="h-4 w-4 text-accent" weight="bold" />
        <label className="text-sm font-medium">Vocal Style</label>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {VOCAL_STYLES.map((style) => {
          const isSelected = value === style.value
          return (
            <Button
              key={style.value}
              size="sm"
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => onChange(style.value)}
              disabled={disabled}
              className={`gap-2 text-xs ${
                isSelected
                  ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                  : 'hover:bg-accent/20 hover:border-accent/50'
              }`}
              title={style.description}
            >
              {style.label}
            </Button>
          )
        })}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {VOCAL_STYLES.find(s => s.value === value)?.description}
      </p>
    </div>
  )
}
