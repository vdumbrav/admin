import type { PresetConfig } from '../types';

export const joinPresetConfig: PresetConfig = {
  id: 'join',
  name: 'Join/Follow Telegram, Discord, X',

  fieldVisibility: {
    group: 'visible', // social OR partner
    provider: 'visible', // telegram, discord, twitter (X)
    uri: 'visible', // Join URL
    reward: 'visible',
    tasks: 'hidden',
    dailyRewards: 'hidden',
    totalReward: 'hidden',
    username: 'conditional', // visible for telegram
    tweetId: 'hidden',
    icon: 'hidden', // Hidden per specification
    partnerIcon: 'hidden', // Icon field covers this
    buttonText: 'hidden', // handled by Connect Gate Requirements (Join/Follow)
    popupDescription: 'hidden', // handled by Connect Gate Requirements
    popupButton: 'hidden', // handled by Connect Gate Requirements
  },

  defaults: {
    type: 'join',
    group: 'social',
    provider: 'telegram',
  },

  businessRules: [],

  connectGateRules: {
    required: true,
    provider: 'match', // Must have Connect quest for same provider
  },

  specialComponents: [],
};
