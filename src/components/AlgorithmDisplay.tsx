import { AlgorithmInfo } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Sparkle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface AlgorithmDisplayProps {
  algorithms: AlgorithmInfo[]
  className?: string
}

export function AlgorithmDisplay({ algorithms, className }: AlgorithmDisplayProps) {
  if (algorithms.length === 0) return null

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <Sparkle className="h-5 w-5 text-accent" weight="fill" />
        <h3 className="text-sm font-medium uppercase tracking-wide">Active Algorithms</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {algorithms.map((algo) => (
          <TooltipProvider key={algo.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="backdrop-cosmic rounded-lg p-3 border border-accent/20 hover:border-accent/40 transition-colors cursor-help">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{algo.name}</p>
                      {algo.formula && (
                        <p className="text-xs font-mono text-accent mt-1 truncate">{algo.formula}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px] font-mono bg-accent/10 border-accent/30">
                      ACTIVE
                    </Badge>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">{algo.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  )
}
