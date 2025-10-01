import type { PresetConfig } from '../types';

export const joinPresetConfig: PresetConfig = {
  id: 'join',
  name: 'Join/Follow Telegram, Discord, X',

  fieldVisibility: {
    group: 'visible', // social OR partner
    provider: 'visible', // telegram, discord, twitter (X)
    type: 'hidden', // Always 'join' - hidden per spec
    uri: 'visible', // Join URL
    reward: 'visible',
    tasks: 'hidden',
    dailyRewards: 'hidden',
    totalReward: 'hidden',
    username: 'hidden', // parsed from URI under the hood
    tweetId: 'hidden',
    icon: 'conditional', // visible if group === 'partner'
    partnerIcon: 'hidden', // Icon field covers this
    buttonText: 'hidden',
    popupDescription: 'hidden',
    popupButton: 'hidden',
    repeatable: 'hidden', // hidden per spec
    badge: 'visible',
    visible: 'visible',
  },

  defaults: {
    type: 'join',
    group: 'social',
    provider: 'telegram',
    badge: true,
    visible: false,
  },

  businessRules: [],

  specialComponents: [],
};
