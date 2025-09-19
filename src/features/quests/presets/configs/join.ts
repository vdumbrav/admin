import type { PresetConfig } from '../types';

export const joinPresetConfig: PresetConfig = {
  id: 'join',
  name: 'Join',
  description: 'Join social media channels, groups, or follow accounts',
  icon: '👥',

  fieldVisibility: {
    group: 'visible', // social OR partner
    provider: 'visible', // telegram, discord, twitter
    uri: 'visible', // Join URL
    reward: 'visible',
    tasks: 'hidden',
    dailyRewards: 'hidden',
    totalReward: 'hidden',
    username: 'hidden',
    tweetId: 'hidden',
    icon: 'hidden',
    partnerIcon: 'conditional', // visible if group === 'partner'
  },

  defaults: {
    type: 'join',
    resources: {
      ui: {
        button: 'Join',
        'pop-up': {
          name: 'Social Quests',
          button: 'Join',
        },
      },
    },
  },

  businessRules: [
    {
      condition: 'provider === "twitter"',
      action: 'set resources.ui.button = "Follow"',
      description: 'For Twitter change button to Follow',
    },
    {
      condition: 'provider === "twitter"',
      action: 'set resources.ui.pop-up.button = "Follow"',
      description: 'For Twitter change popup button to Follow',
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

  connectGateRules: {
    required: true,
    provider: 'match', // Must have Connect quest for same provider
  },

  specialComponents: [],
};
