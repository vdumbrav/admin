import type { PresetConfig } from '../types';

/**
 * Mobile App Quest Preset
 * For creating mobile app quests (install, onramp, offramp, swap, send)
 * with configurable limits and amounts
 */
export const mobilePresetConfig: PresetConfig = {
  id: 'mobile',
  name: 'Mobile App Quest',

  fieldVisibility: {
    type: 'visible', // Allow selecting mobile quest type
    group: 'readonly', // Fixed to 'mobile' group
    provider: 'hidden', // No provider needed for mobile quests
    uri: 'visible', // Play Store URL for install quest
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
    repeatable: 'hidden', // Mobile quests are one-time
    badge: 'visible',
    visible: 'visible',
    // Card limit fields - reuse for mobile transaction limits
    cardMinAmount: 'visible',
    cardTargetAmount: 'hidden', // No target amount for mobile quests
  },

  defaults: {
    type: 'mobile-install', // Default to app install type
    group: 'mobile', // Always mobile group
    provider: undefined,
    badge: true,
    visible: true,
    resources: {
      isNew: true,
      ui: {
        button: 'Complete',
        'pop-up': {
          name: 'Mobile App Quests',
          button: 'Complete',
          description: 'Complete mobile app actions to earn XP',
        },
      },
      limits: {
        min_amount: 0,
      },
    },
  },

  businessRules: [],

  specialComponents: [],
};
