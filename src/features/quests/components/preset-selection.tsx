import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { listPresets } from '../presets';
import { useQuestSearch } from '../use-quest-search';
import { PresetCard } from './preset-card';

export const PresetSelection = () => {
  const navigate = useNavigate();
  const search = useQuestSearch({
    from: '/_authenticated/quests/new' as const,
  });

  const presets = listPresets();

  return (
    <div className='mx-auto max-w-5xl space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Choose a Quest Type</h1>
          <p className='text-muted-foreground'>
            Select a preset to create your quest with pre-configured settings
          </p>
        </div>
        <div className='flex gap-3'>
          <Button variant='outline' onClick={() => void navigate({ to: '/quests', search })}>
            Back to list
          </Button>
          <Button
            variant='ghost'
            onClick={() =>
              void navigate({
                to: '/quests/new',
                search: { ...search, showForm: true },
                replace: true,
              })
            }
          >
            Create without preset
          </Button>
        </div>
      </div>

      {/* Preset Grid */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {presets.map((preset) => (
          <PresetCard key={preset.id} preset={preset} />
        ))}
      </div>

      {/* Help Text */}
      <div className='bg-muted/50 mt-8 rounded-lg border p-4'>
        <h3 className='mb-2 font-medium'>Need help choosing?</h3>
        <ul className='text-muted-foreground space-y-1 text-sm'>
          <li>
            <strong>Connect:</strong> For linking social media accounts
          </li>
          <li>
            <strong>Join:</strong> For joining channels, groups or following accounts
          </li>
          <li>
            <strong>Action with Post:</strong> For Twitter interactions (like, comment, retweet)
          </li>
          <li>
            <strong>7-Day Challenge:</strong> For daily reward campaigns
          </li>
          <li>
            <strong>Explore:</strong> For external links and custom actions
          </li>
        </ul>
      </div>
    </div>
  );
};
