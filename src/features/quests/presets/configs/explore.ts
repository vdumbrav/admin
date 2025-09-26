import type { PresetConfig } from '../types';

export const explorePresetConfig: PresetConfig = {
  id: 'explore',
  name: 'Explore',

  fieldVisibility: {
    type: 'hidden', // Fixed to 'external' for Explore preset
    group: 'visible', // Any group allowed
    provider: 'readonly', // Fixed to 'internal' for Explore preset
    uri: 'visible', // Required external URL
    reward: 'visible',
    tasks: 'hidden',
    dailyRewards: 'hidden',
    totalReward: 'hidden',
    username: 'hidden',
    tweetId: 'hidden',
    icon: 'visible', // Always available (not only Partner)
    partnerIcon: 'hidden', // Icon field covers this
    buttonText: 'visible', // Button name for Explore
    popupDescription: 'visible', // Popup description for Explore
    popupButton: 'visible', // Popup button name for Explore
    repeatable: 'visible', // Repeatable toggle for Explore
  },

  defaults: {
    type: 'external',
    provider: 'walme',
    group: 'social', // Default to social group for Explore
    // start: (() => {
    //   const now = new Date();
    //   now.setHours(now.getHours() + 1); // +1 hour from creation
    //   return now.toISOString();
    // })(),
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
