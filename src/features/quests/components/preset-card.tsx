import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { defaultQuestSearch } from '../default-search';
import type { PresetConfig } from '../presets';

interface PresetCardProps {
  preset: PresetConfig;
  className?: string;
}

export const PresetCard = ({ preset, className }: PresetCardProps) => {
  return (
    <Link
      to='/quests/new/$preset'
      params={{ preset: preset.id }}
      search={{ ...defaultQuestSearch, showForm: false }}
      aria-label={`Create quest with ${preset.name} preset`}
      className={className}
    >
      <Card className='hover:border-primary/20 h-full transform-gpu cursor-pointer border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-md'>
        <CardHeader className='pb-3'>
          <div className='flex items-center gap-3'>
            <div className='text-3xl'>{preset.icon}</div>
            <div>
              <CardTitle className='text-lg font-semibold'>{preset.name}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className='text-muted-foreground text-sm leading-relaxed'>
            {preset.description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
};
