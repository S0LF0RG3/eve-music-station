import { Badge } from '@/components/ui/badge'
import { X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

interface GenreSelectorProps {
  genres: string[]
  selectedGenres: string[]
  onToggleGenre: (genre: string) => void
  maxSelection?: number
}

export function GenreSelector({ genres, selectedGenres, onToggleGenre, maxSelection = 4 }: GenreSelectorProps) {
  const isSelected = (genre: string) => selectedGenres.includes(genre)
  const canSelect = selectedGenres.length < maxSelection

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium uppercase tracking-wide">
          Select Genres ({selectedGenres.length}/{maxSelection})
        </label>
      </div>

      <ScrollArea className="h-[200px] rounded-lg border border-border bg-card/50 p-4">
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => {
            const selected = isSelected(genre)
            const disabled = !selected && !canSelect

            return (
              <Badge
                key={genre}
                variant={selected ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-all duration-200 font-mono text-xs',
                  selected
                    ? 'bg-primary border-accent text-primary-foreground shadow-lg shadow-accent/20'
                    : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary hover:border-muted-foreground/50',
                  disabled && 'opacity-40 cursor-not-allowed',
                  !disabled && !selected && 'hover:scale-105'
                )}
                onClick={() => !disabled && onToggleGenre(genre)}
              >
                {genre}
                {selected && <X className="ml-1 h-3 w-3" weight="bold" />}
              </Badge>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
