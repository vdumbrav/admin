import type { PresetConfig } from '../types';

export const sevenDayChallengePresetConfig: PresetConfig = {
  id: 'seven-day-challenge',
  name: 'Day challenge',

  fieldVisibility: {
    type: 'readonly', // Always 'repeatable'
    group: 'readonly', // Always 'daily'
    provider: 'hidden', // Hidden per specification
    uri: 'hidden', // Not used
    reward: 'hidden', // Use totalReward instead
    tasks: 'hidden',
    dailyRewards: 'visible', // Day 1-7 with rewards
    totalReward: 'readonly', // Sum of daily rewards
    username: 'hidden',
    tweetId: 'hidden',
    icon: 'hidden',
    partnerIcon: 'hidden',
    badge: 'visible',
    visible: 'visible',
  },

  defaults: {
    type: 'repeatable',
    group: 'daily',
    provider: 'walme',
    badge: true,
    visible: false,
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
