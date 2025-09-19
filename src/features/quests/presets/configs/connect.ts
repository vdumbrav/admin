import type { PresetConfig } from '../types';

export const connectPresetConfig: PresetConfig = {
  id: 'connect',
  name: 'Connect',
  description: 'Connect social media account to unlock platform-specific quests',
  icon: '🔗',

  fieldVisibility: {
    group: 'locked', // Always 'social'
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

  lockedFields: {
    group: 'social',
    type: 'connect',
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
        },
      },
    },
  },

  businessRules: [
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
