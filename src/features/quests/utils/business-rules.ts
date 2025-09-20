import type { PresetConfig } from '../presets';
import type { FormPopupResources, QuestFormValues } from '../types/form-types';

/**
 * Apply business rules from preset configuration to form values
 */
export function applyBusinessRules(
  values: Partial<QuestFormValues>,
  presetConfig?: PresetConfig,
): Partial<QuestFormValues> {
  if (!presetConfig?.businessRules) {
    return values;
  }

  const result = { ...values };

  for (const rule of presetConfig.businessRules) {
    switch (rule.action) {
      case 'auto-generate resources.ui.pop-up.name':
        if (rule.condition === 'group' && rule.mapping && values.group) {
          const groupName = rule.mapping[values.group];
          if (groupName) {
            result.resources = {
              ...result.resources,
              ui: {
                ...result.resources?.ui,
                button: result.resources?.ui?.button ?? 'Join',
                'pop-up': {
                  name: groupName,
                  button: result.resources?.ui?.['pop-up']?.button ?? 'Join',
                  description: result.resources?.ui?.['pop-up']?.description ?? '',
                } as FormPopupResources,
              },
            };
          }
        }
        break;

      case 'set resources.ui.button = "Follow"':
        if (rule.condition === 'provider === "twitter"' && values.provider === 'twitter') {
          result.resources = {
            ...result.resources,
            ui: {
              ...result.resources?.ui,
              button: 'Follow',
            },
          };
        }
        break;

      case 'set resources.ui.pop-up.button = "Follow"':
        if (rule.condition === 'provider === "twitter"' && values.provider === 'twitter') {
          result.resources = {
            ...result.resources,
            ui: {
              ...result.resources?.ui,
              button: result.resources?.ui?.button ?? 'Follow',
              'pop-up': {
                name: result.resources?.ui?.['pop-up']?.name ?? 'Social Quests',
                button: 'Follow',
                description: result.resources?.ui?.['pop-up']?.description ?? '',
              },
            },
          };
        }
        break;

      case 'set totalReward from child.sum(reward)':
        if (values.child && Array.isArray(values.child)) {
          const totalReward = values.child.reduce((sum, task) => sum + (task.reward ?? 0), 0);
          (result as QuestFormValues & { totalReward: number }).totalReward = totalReward;
        }
        break;

      case 'set order_by from index':
        if (values.child && Array.isArray(values.child)) {
          result.child = values.child.map((task, index) => ({
            ...task,
            order_by: index,
          }));
        }
        break;

      default:
        console.warn(`Unknown business rule action: ${rule.action}`);
    }
  }

  return result;
}
