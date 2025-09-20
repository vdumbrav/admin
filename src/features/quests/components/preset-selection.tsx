import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { SelectDropdown } from '@/components/select-dropdown';
import { listPresets } from '../presets';

export const PresetSelection = () => {
  const navigate = useNavigate();

  const presets = listPresets();
  const presetItems = presets.map((p) => ({ value: p.id, label: `${p.icon} ${p.name}` }));

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
          <Button variant='outline' onClick={() => void navigate({ to: '/quests' })}>
            Back to list
          </Button>
          <Button
            variant='ghost'
            onClick={() => void navigate({ to: '/quests/new', search: { showForm: true } })}
          >
            Create without preset
          </Button>
        </div>
      </div>

      {/* Preset Select */}
      <div className='mx-auto max-w-md'>
        <label htmlFor='preset-select' className='mb-2 block text-sm font-medium'>
          Choose a quest preset…
        </label>
        <SelectDropdown
          className='w-full'
          placeholder='Select a preset'
          items={presetItems}
          onValueChange={(value) =>
            void navigate({ to: '/quests/new/$preset', params: { preset: value } })
          }
        />
        <p className='text-muted-foreground mt-2 text-sm' id='preset-help'>
          Select one of the available presets to start with recommended defaults.
        </p>
      </div>

      {/* Quick Preset Descriptions */}
      <div className='bg-muted/50 mt-8 rounded-lg border p-4'>
        <h3 className='mb-2 font-medium'>Preset descriptions</h3>
        <ul className='text-muted-foreground space-y-1 text-sm'>
          <li>
            <strong>🔗 Connect:</strong> Link a social account
          </li>
          <li>
            <strong>👥 Join:</strong> Join channels/groups or follow
          </li>
          <li>
            <strong>💬 Action with Post:</strong> Like, comment, share on X/Twitter
          </li>
          <li>
            <strong>📅 7-Day Challenge:</strong> Daily rewards over multiple days
          </li>
          <li>
            <strong>🌐 Explore:</strong> External link with custom button
          </li>
        </ul>
      </div>
    </div>
  );
};
