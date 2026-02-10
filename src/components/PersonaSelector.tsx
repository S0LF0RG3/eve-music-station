import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { SunoAuthService, SunoPersona } from '../lib/sunoAuthService';
import { UserCircle, ArrowsClockwise } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface PersonaSelectorProps {
  value?: string;
  onChange: (persona: string) => void;
  disabled?: boolean;
}

export function PersonaSelector({ value, onChange, disabled }: PersonaSelectorProps) {
  const [personas, setPersonas] = useState<SunoPersona[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    setIsLoading(true);
    try {
      const fetchedPersonas = await SunoAuthService.getPersonas();
      setPersonas(fetchedPersonas);
    } catch (error) {
      toast.error('Failed to load personas from Suno');
      console.error('Failed to load personas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[oklch(0.95_0.02_285)] flex items-center gap-2">
          <UserCircle size={16} weight="fill" />
          Suno Persona
        </label>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadPersonas}
          disabled={isLoading || disabled}
        >
          <ArrowsClockwise size={16} className={isLoading ? 'animate-spin' : ''} />
        </Button>
      </div>

      <Select value={value} onValueChange={onChange} disabled={disabled || isLoading}>
        <SelectTrigger className="w-full bg-[oklch(0.15_0.02_285)] border-[oklch(0.25_0.08_260)] text-[oklch(0.95_0.02_285)]">
          <SelectValue placeholder="Select a persona..." />
        </SelectTrigger>
        <SelectContent className="bg-[oklch(0.15_0.02_285)] border-[oklch(0.25_0.08_260)]">
          {personas.length === 0 ? (
            <SelectItem value="none" disabled>
              {isLoading ? 'Loading personas...' : 'No personas available'}
            </SelectItem>
          ) : (
            personas.map((persona) => (
              <SelectItem 
                key={persona.value} 
                value={persona.value}
                className="text-[oklch(0.95_0.02_285)] hover:bg-[oklch(0.25_0.08_260)]"
              >
                {persona.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {personas.length === 0 && !isLoading && (
        <p className="text-xs text-gray-400">
          Connect to Suno to load your personas
        </p>
      )}
    </div>
  );
}
