import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      search={{
        showForm: false,
        search: '',
        group: 'all',
        type: '',
        provider: '',
        visible: '',
        page: 1,
        limit: 20,
        sort: 'order_by:asc',
      }}
      className={className}
    >
      <Card className='hover:border-primary/20 h-full cursor-pointer border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-md'>
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
