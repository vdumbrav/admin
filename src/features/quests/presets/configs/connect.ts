import type { PresetConfig } from '../types';

export const connectPresetConfig: PresetConfig = {
  id: 'connect',
  name: 'Connect Telegram, Discord, X',

  fieldVisibility: {
    group: 'visible', // Allow group selection
    provider: 'visible', // telegram, discord, twitter
    type: 'hidden', // Always 'connect'
    uri: 'hidden', // Show static text "URL: User's data"
    reward: 'visible',
    tasks: 'hidden',
    dailyRewards: 'hidden',
    totalReward: 'hidden',
    username: 'hidden',
    tweetId: 'hidden',
    icon: 'hidden',
    partnerIcon: 'hidden',
    buttonText: 'hidden',
    popupDescription: 'hidden', // Auto-generated based on provider
    popupButton: 'hidden',
    repeatable: 'hidden', // Connect tasks are not repeatable
  },

  defaults: {
    type: 'connect',
    group: 'social',
    // provider is selected by user (telegram, discord, twitter)
  },

  businessRules: [],

  specialComponents: [],
};
