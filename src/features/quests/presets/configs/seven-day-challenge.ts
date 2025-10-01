import type { PresetConfig } from '../types';

export const sevenDayChallengePresetConfig: PresetConfig = {
  id: 'seven-day-challenge',
  name: 'Day challenge',

  fieldVisibility: {
    type: 'hidden', // Always 'repeatable'
    group: 'readonly', // Always 'daily'
    provider: 'hidden', // Hidden per specification
    uri: 'hidden', // Not used
    reward: 'hidden', // Use totalReward instead
    tasks: 'hidden',
    dailyRewards: 'visible', // Day 1-7 with rewards
    totalReward: 'readonly', // Sum of daily rewards
    username: 'hidden',
    tweetId: 'hidden',
    icon: 'conditional', // Visible if group === 'partner'
    partnerIcon: 'hidden',
    buttonText: 'visible', // Button name - default "Boost XP"
    popupButton: 'visible', // Popup button name - default "Boost XP"
    popupDescription: 'hidden', // Auto-generated
    repeatable: 'hidden', // Always true for seven-day challenges
    badge: 'visible',
    visible: 'visible',
  },

  defaults: {
    type: 'repeatable',
    group: 'daily',
    provider: 'walme',
    repeatable: true,
    enabled: false,
    resources: {
      isNew: true,
      ui: {
        button: 'Boost XP',
        'pop-up': {
          button: 'Boost XP',
        },
      },
    },
    iterator: {
      days: 7,
      reward_map: [10, 20, 30, 40, 50, 70, 100],
    },
  },

  businessRules: [],

  rewardCalculation: {
    source: 'iterator.reward_map',
    field: 'totalReward',
    readonly: true,
  },

  specialComponents: ['DailyRewardsEditor'],
};
