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
      condition: 'provider === "telegram" || provider === "discord"',
      action: 'set resources.ui.button = "Join"',
      description: 'For Telegram/Discord use Join button',
    },
    {
      condition: 'provider === "telegram" || provider === "discord"',
      action: 'set resources.ui.pop-up.button = "Join"',
      description: 'For Telegram/Discord use Join popup button',
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
