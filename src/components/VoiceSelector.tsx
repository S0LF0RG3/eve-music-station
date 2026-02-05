import { VoiceType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { User, UserSound, MusicNote } from '@phosphor-icons/react'

interface VoiceSelectorProps {
  value: VoiceType
  onChange: (voice: VoiceType) => void
}

export function VoiceSelector({ value, onChange }: VoiceSelectorProps) {
  const options: { value: VoiceType; label: string; icon: typeof User }[] = [
    { value: 'male', label: 'Male', icon: User },
    { value: 'female', label: 'Female', icon: UserSound },
    { value: 'instrumental', label: 'Instrumental', icon: MusicNote },
  ]

  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((option) => {
        const Icon = option.icon
        const isSelected = value === option.value
        return (
          <Button
            key={option.value}
            size="sm"
            variant={isSelected ? 'default' : 'outline'}
            onClick={() => onChange(option.value)}
            className={`gap-2 ${
              isSelected
                ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                : 'hover:bg-accent/20 hover:border-accent/50'
            }`}
          >
            <Icon className="h-4 w-4" weight={isSelected ? 'fill' : 'regular'} />
            {option.label}
          </Button>
        )
      })}
    </div>
  )
}
