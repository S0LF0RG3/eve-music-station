import { VocalStyle } from '@/lib/types'
import { getVocalRecommendations } from '@/lib/vocalRecommendations'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sparkle, TrendUp } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface VocalRecommendationsProps {
  genres: string[]
  currentStyle: VocalStyle
  onSelectStyle: (style: VocalStyle) => void
}

export function VocalRecommendations({ genres, currentStyle, onSelectStyle }: VocalRecommendationsProps) {
  if (genres.length === 0) {
    return null
  }

  const recommendations = getVocalRecommendations(genres)

  if (recommendations.length === 0) {
    return null
  }

  const isCurrentStyleRecommended = recommendations.some(r => r.style === currentStyle)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-4 backdrop-cosmic border-accent/30 bg-accent/5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkle className="h-4 w-4 text-accent" weight="fill" />
              <h4 className="text-sm font-medium uppercase tracking-wide">
                Recommended Vocal Styles for {genres.join(' + ')}
              </h4>
            </div>

            <div className="flex flex-wrap gap-2">
              {recommendations.map((rec, index) => {
                const isSelected = currentStyle === rec.style
                const confidenceColor =
                  rec.confidence >= 80
                    ? 'text-green-400'
                    : rec.confidence >= 60
                    ? 'text-accent'
                    : 'text-yellow-400'

                return (
                  <motion.div
                    key={rec.style}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Button
                      size="sm"
                      variant={isSelected ? 'default' : 'outline'}
                      onClick={() => onSelectStyle(rec.style)}
                      className={`gap-2 ${
                        isSelected
                          ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                          : 'hover:bg-accent/20 hover:border-accent/50'
                      }`}
                      title={rec.reasoning}
                    >
                      {index === 0 && <TrendUp className="h-3 w-3" weight="bold" />}
                      <span className="capitalize">{rec.style.replace('-', ' ')}</span>
                      <span className={`text-xs font-mono ${confidenceColor}`}>
                        {rec.confidence}%
                      </span>
                    </Button>
                  </motion.div>
                )
              })}
            </div>

            {!isCurrentStyleRecommended && currentStyle !== 'none' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-border"
              >
                💡 Your current style ({currentStyle}) may not be ideal for these genres. Consider one of the recommended styles above.
              </motion.div>
            )}

            {recommendations.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {recommendations[0].reasoning}
              </p>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
