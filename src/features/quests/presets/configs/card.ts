import type { PresetConfig } from '../types';

/**
 * Card Quest Preset
 * For creating card-related quests (issue, purchase, topup, milestones)
 */
export const cardPresetConfig: PresetConfig = {
  id: 'card',
  name: 'Card Quest',

  fieldVisibility: {
    type: 'visible', // Allow selecting card quest type
    group: 'readonly', // Fixed to 'card' group
    provider: 'hidden', // No provider needed for card quests
    uri: 'hidden', // No URL needed
    reward: 'visible', // XP reward
    tasks: 'hidden', // No subtasks
    dailyRewards: 'hidden', // No daily rewards map
    totalReward: 'hidden',
    username: 'hidden',
    tweetId: 'hidden',
    icon: 'visible', // Allow custom icon
    partnerIcon: 'hidden',
    buttonText: 'visible', // Button text for the quest
    popupDescription: 'visible', // Description in popup
    popupButton: 'visible', // Button in popup
    repeatable: 'visible', // Some card quests are repeatable (daily/monthly)
    badge: 'visible',
    visible: 'visible',
  },

  defaults: {
    type: 'card-issue', // Default to card issue type
    group: 'card', // Always card group
    provider: undefined,
    badge: true,
    visible: true,
    resources: {
      isNew: true,
      ui: {
        button: 'Complete',
        'pop-up': {
          name: 'Card Quests',
          button: 'Complete',
          description: 'Complete card actions to earn XP',
        },
      },
    },
  },

  businessRules: [],

  specialComponents: [],
};