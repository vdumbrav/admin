import type { PresetConfig } from '../types';

export const explorePresetConfig: PresetConfig = {
  id: 'explore',
  name: 'Explore',
  description: 'Navigate to external resources and websites',
  icon: '🔍',

  fieldVisibility: {
    group: 'visible', // Any group allowed
    provider: 'visible', // Usually 'walme' (Internal), but flexible
    uri: 'visible', // Required external URL
    reward: 'visible',
    tasks: 'hidden',
    dailyRewards: 'hidden',
    totalReward: 'hidden',
    username: 'hidden',
    tweetId: 'hidden',
    icon: 'visible', // Always available (not only Partner)
    partnerIcon: 'hidden', // Icon field covers this
  },

  defaults: {
    type: 'external',
    resources: {
      ui: {
        button: 'Explore',
        'pop-up': {
          name: 'Social Quests', // Will be auto-generated based on group
          button: 'Explore',
          description: '',
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

  connectGateRules: {
    conditional: true,
    trigger: 'uri_domain', // Only if URI matches social domains
    domains: ['x.com', 'twitter.com', 't.me', 'discord.com', 'discord.gg'],
  },

  specialComponents: [],
};
