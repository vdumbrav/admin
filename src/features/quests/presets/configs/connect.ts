import type { PresetConfig } from '../types';

export const connectPresetConfig: PresetConfig = {
  id: 'connect',
  name: 'Connect Telegram, Discord, X',

  fieldVisibility: {
    group: 'readonly', // Always 'social' - readonly per spec
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
    badge: 'visible',
    visible: 'visible',
  },

  defaults: {
    type: 'connect',
    group: 'social',
    badge: true,
    visible: false,
    // provider is selected by user (telegram, discord, twitter)
  },

  businessRules: [],

  specialComponents: [],
};
