import type { PresetConfig } from '../types';

export const joinPresetConfig: PresetConfig = {
  id: 'join',
  name: 'Join/Follow Telegram, Discord, X',

  fieldVisibility: {
    group: 'visible', // social OR partner
    provider: 'visible', // telegram, discord, twitter
    uri: 'visible', // Join URL
    reward: 'visible',
    tasks: 'hidden',
    dailyRewards: 'hidden',
    totalReward: 'hidden',
    username: 'conditional', // visible for telegram
    tweetId: 'hidden',
    icon: 'conditional', // visible if group === 'partner'
    partnerIcon: 'hidden', // Icon field covers this
  },

  defaults: {
    type: 'join',
    resources: {
      ui: {
        button: 'Join',
        'pop-up': {
          name: 'Social Quests',
          button: 'Join',
          description: '',
          'additional-title': '',
          'additional-description': '',
        },
      },
      // isNew: true,
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
