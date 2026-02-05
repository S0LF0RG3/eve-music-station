import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Plus } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

interface GenreSelectorProps {
  genres: string[]
  selectedGenres: string[]
  onToggleGenre: (genre: string) => void
  maxSelection?: number
}

export function GenreSelector({ genres, selectedGenres, onToggleGenre, maxSelection = 4 }: GenreSelectorProps) {
  const [customGenre, setCustomGenre] = useState('')
  
  const isSelected = (genre: string) => selectedGenres.includes(genre)
  const canSelect = selectedGenres.length < maxSelection

  const handleAddCustomGenre = () => {
    const trimmed = customGenre.trim()
    if (trimmed && !selectedGenres.includes(trimmed) && canSelect) {
      onToggleGenre(trimmed)
      setCustomGenre('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCustomGenre()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium uppercase tracking-wide">
          Select Genres ({selectedGenres.length}/{maxSelection})
        </label>
      </div>

      <div className="flex gap-2">
        <Input
          id="custom-genre"
          value={customGenre}
          onChange={(e) => setCustomGenre(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add custom genre..."
          className="bg-background/50 font-mono text-sm"
          maxLength={30}
          disabled={!canSelect}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleAddCustomGenre}
          disabled={!customGenre.trim() || !canSelect}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
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

      {selectedGenres.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Selected Genres
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedGenres.map((genre) => (
              <Badge
                key={genre}
                variant="default"
                className="bg-accent text-accent-foreground cursor-pointer hover:bg-accent/80 font-mono"
                onClick={() => onToggleGenre(genre)}
              >
                {genre}
                <X className="ml-1 h-3 w-3" weight="bold" />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
