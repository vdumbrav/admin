import type { PresetConfig } from '../types';

export const connectPresetConfig: PresetConfig = {
  id: 'connect',
  name: 'Connect',
  description: 'Connect social media account to unlock platform-specific quests',
  icon: '🔗',

  fieldVisibility: {
    group: 'readonly', // Always 'social'
    provider: 'visible', // telegram, discord, twitter
    uri: 'hidden', // Show static text "URL: User's data"
    reward: 'visible',
    tasks: 'hidden',
    dailyRewards: 'hidden',
    totalReward: 'hidden',
    username: 'hidden',
    tweetId: 'hidden',
    icon: 'hidden',
    partnerIcon: 'hidden',
  },

  defaults: {
    type: 'connect',
    group: 'social',
    resources: {
      ui: {
        button: 'Connect',
        'pop-up': {
          name: 'Social Quests',
          button: 'Connect',
          description: '',
        },
      },
    },
  },

  businessRules: [
    {
      condition: 'provider === "matrix"',
      action: 'set resources.ui.button = "Add"',
      description: 'For Matrix change button to Add',
    },
    {
      condition: 'provider === "matrix"',
      action: 'set resources.ui.pop-up.button = "Add"',
      description: 'For Matrix change popup button to Add',
    },
    {
      condition: 'group',
      action: 'auto-generate resources.ui.pop-up.name',
      description: 'Auto-generate popup name based on group',
      mapping: {
        social: 'Social Quests',
        daily: 'Daily Quests',
        partner: 'Partner Quests',
      },
    },
  ],

  specialComponents: [],
};
