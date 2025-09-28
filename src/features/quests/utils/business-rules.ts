import type { ResourcesUiPopUpDto } from '@/lib/api/generated/model';
import type { PresetConfig } from '../presets';
import type { QuestFormValues } from '../types/form-types';

/**
 * STRICT BUSINESS RULES - FAIL FAST ON INVALID CONFIGURATIONS
 *
 * ⚠️  BREAKING: No longer tolerates missing resources or invalid mappings
 * Will throw errors instead of silently skipping rules or using fallbacks
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
          if (!groupName) {
            throw new Error(`No group mapping found for group: ${values.group}`);
          }

          // STRICT: resources must exist
          if (!result.resources?.ui) {
            throw new Error('Resources.ui is required for auto-generation');
          }

          result.resources = {
            ...result.resources,
            ui: {
              ...result.resources.ui,
              button: result.resources.ui.button ?? 'Join',
              'pop-up': {
                name: groupName,
                button: result.resources.ui['pop-up']?.button ?? 'Join',
                description: result.resources.ui['pop-up']?.description ?? '',
              } as ResourcesUiPopUpDto,
            },
          };
        }
        break;

      case 'auto-generate resources.ui.pop-up.description':
        if (rule.condition === 'provider' && rule.mapping && values.provider) {
          const description = rule.mapping[values.provider];
          if (!description) {
            throw new Error(`No provider mapping found for provider: ${values.provider}`);
          }

          // STRICT: resources must exist
          if (!result.resources?.ui) {
            throw new Error('Resources.ui is required for description auto-generation');
          }

          result.resources = {
            ...result.resources,
            ui: {
              ...result.resources.ui,
              'pop-up': {
                name: result.resources.ui['pop-up']?.name ?? 'Social Quests',
                button: result.resources.ui['pop-up']?.button ?? 'Connect',
                description: description,
              } as ResourcesUiPopUpDto,
            },
          };
        }
        break;

      case 'set resources.ui.button = "Follow"':
        if (rule.condition === 'provider === "twitter"' && values.provider === 'twitter') {
          if (!result.resources) {
            throw new Error('Resources are required for Twitter provider rules');
          }

          result.resources = {
            ...result.resources,
            ui: {
              ...result.resources.ui,
              button: 'Follow',
            },
          };
        }
        break;

      case 'set resources.ui.pop-up.button = "Follow"':
        if (rule.condition === 'provider === "twitter"' && values.provider === 'twitter') {
          if (!result.resources?.ui) {
            throw new Error('Resources.ui is required for Twitter provider rules');
          }

          result.resources = {
            ...result.resources,
            ui: {
              ...result.resources.ui,
              button: result.resources.ui.button ?? 'Follow',
              'pop-up': {
                name: result.resources.ui['pop-up']?.name ?? 'Social Quests',
                button: 'Follow',
                description: result.resources.ui['pop-up']?.description ?? '',
              },
            },
          };
        }
        break;

      case 'set totalReward from child.sum(reward)': {
        if (!values.child || !Array.isArray(values.child)) {
          throw new Error('Child tasks array is required for totalReward calculation');
        }

        const totalReward = values.child.reduce((sum, task) => {
          if (typeof task.reward !== 'number') {
            throw new Error(
              `Child task reward must be a number, got ${typeof task.reward} for task: ${task.title}`,
            );
          }
          return sum + task.reward;
        }, 0);
        (result as QuestFormValues & { totalReward: number }).totalReward = totalReward;
        break;
      }

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
