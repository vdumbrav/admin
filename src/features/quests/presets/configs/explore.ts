import type { PresetConfig } from '../types';

export const explorePresetConfig: PresetConfig = {
  id: 'explore',
  name: 'Explore',

  fieldVisibility: {
    type: 'hidden', // Fixed to 'external' for Explore preset
    group: 'visible', // Any group allowed
    provider: 'hidden', // Hidden per specification (provider selection = hidden for explore)
    uri: 'visible', // Visible per specification (URL field = visible for explore)
    reward: 'visible',
    tasks: 'hidden', // Hidden per specification (subtasks = hidden for explore)
    dailyRewards: 'hidden', // Hidden per specification (reward map = hidden for explore)
    totalReward: 'hidden',
    username: 'hidden',
    tweetId: 'hidden',
    icon: 'visible', // Visible per specification (icon = visible for explore)
    partnerIcon: 'hidden', // Icon field covers this
    buttonText: 'visible', // Button name for Explore
    popupDescription: 'visible', // Popup description for Explore
    popupButton: 'visible', // Popup button name for Explore
    repeatable: 'visible', // Repeatable toggle for Explore
    badge: 'visible',
    visible: 'visible',
  },

  defaults: {
    type: 'external',
    provider: 'walme',
    group: 'social',
    badge: true,
    visible: false,
  },

  businessRules: [],

  connectGateRules: {
    conditional: true,
    trigger: 'uri_domain', // Only if URI matches social domains
    domains: ['x.com', 'twitter.com', 't.me', 'discord.com', 'discord.gg'],
  },

  specialComponents: [],
};
