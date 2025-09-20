import type { PresetConfig } from '../types';

export const sevenDayChallengePresetConfig: PresetConfig = {
  id: 'seven-day-challenge',
  name: '7-day challenge',
  description: 'Daily rewards for consecutive engagement over 7 days',
  icon: '📅',

  fieldVisibility: {
    group: 'readonly', // Always 'daily'
    provider: 'readonly', // Always 'walme'
    uri: 'hidden', // Not used
    reward: 'hidden', // Use totalReward instead
    tasks: 'hidden',
    dailyRewards: 'visible', // Day 1-7 with rewards
    totalReward: 'readonly', // Sum of daily rewards
    username: 'hidden',
    tweetId: 'hidden',
    icon: 'hidden',
    partnerIcon: 'hidden',
  },

  defaults: {
    type: 'repeatable',
    group: 'daily',
    provider: 'walme',
    iterator: {
      days: 7,
      reward_map: [10, 20, 30, 40, 50, 70, 100],
    },
    resources: {
      ui: {
        button: 'Boost XP',
        'pop-up': {
          name: 'Daily Quests',
          button: 'Boost XP',
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

  rewardCalculation: {
    source: 'iterator.reward_map',
    field: 'totalReward',
    readonly: true,
  },

  specialComponents: ['DailyRewardsEditor'],
};
