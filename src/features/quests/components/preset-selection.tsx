import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { SelectDropdown } from '@/components/select-dropdown';
import { createQuestSearch } from '../default-search';
import { listPresets } from '../presets';

export const PresetSelection = () => {
  const navigate = useNavigate();
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const presets = listPresets();
  const presetItems = presets.map((p) => ({ value: p.id, label: p.name }));

  const handleSave = () => {
    if (selectedPreset) {
      void navigate({
        to: '/quests/new/$preset',
        params: { preset: selectedPreset },
        search: createQuestSearch(),
      });
    }
  };

  return (
    <div className='mx-auto max-w-5xl space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>New Quest</h1>
          <p className='text-muted-foreground'>
            Select quest preset
          </p>
        </div>
        <Button
          variant='outline'
          onClick={() => void navigate({ to: '/quests', search: createQuestSearch() })}
        >
          Back to list
        </Button>
      </div>

      {/* Preset Select */}
      <div className='max-w-md'>
        <div className='flex gap-3'>
          <SelectDropdown
            className='flex-1'
            placeholder='Select preset'
            items={presetItems}
            value={selectedPreset}
            onValueChange={setSelectedPreset}
          />
          <Button
            onClick={handleSave}
            disabled={!selectedPreset}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};
