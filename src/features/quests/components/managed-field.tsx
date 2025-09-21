import { useFormContext } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { PresetConfig } from '../presets';

interface ManagedFieldProps {
  name: string;
  label: string;
  presetConfig?: PresetConfig;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Helper function to get nested value from object by path
 */
const getNestedValue = (obj: unknown, path: string): unknown => {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
};

/**
 * Field component that shows "overridden" badge and reset button for preset-managed fields
 */
export const ManagedField = ({
  name,
  label,
  presetConfig,
  disabled,
  placeholder,
}: ManagedFieldProps) => {
  const { control, setValue, getValues, formState } = useFormContext();

  // Check if field is dirty (manually changed by user)
  const isDirty = getNestedValue(formState.dirtyFields, name);

  // Get initial/preset value from preset config defaults
  const getPresetValue = () => {
    if (!presetConfig?.defaults) return undefined;
    return getNestedValue(presetConfig.defaults, name);
  };

  const presetValue = getPresetValue();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const currentValue = getValues(name);
  const isOverridden = !!(isDirty && presetValue !== undefined && currentValue !== presetValue);

  const isDefaultedByPreset = !!(
    presetConfig?.defaults &&
    presetValue !== undefined &&
    currentValue === presetValue &&
    !isDirty
  );

  const handleReset = () => {
    if (presetValue !== undefined) {
      setValue(name, presetValue, { shouldDirty: false });
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className='flex items-center justify-between'>
            <FormLabel>{label}</FormLabel>
            <div className='flex items-center gap-2'>
              {isDefaultedByPreset && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant='secondary' className='text-xs'>
                        Defaulted by preset
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      Значение подставлено из пресета. Вы можете переопределить его.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {isOverridden && (
                <>
                  <Badge variant='secondary' className='text-xs'>
                    Overridden
                  </Badge>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={handleReset}
                    className='h-6 px-2 text-xs'
                  >
                    Reset to preset
                  </Button>
                </>
              )}
            </div>
          </div>
          <FormControl>
            <Input
              {...field}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              value={field.value ?? ''}
              disabled={disabled}
              placeholder={placeholder}
            />
          </FormControl>
          {presetConfig && presetValue !== undefined && (
            <div className='text-muted-foreground text-xs'>
              {/* eslint-disable-next-line @typescript-eslint/no-base-to-string */}
              Preset value: "{String(presetValue)}"
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
