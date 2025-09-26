import type { PresetConfig } from '../types';

export const actionWithPostPresetConfig: PresetConfig = {
  id: 'action-with-post',
  name: 'Action with post',

  fieldVisibility: {
    type: 'readonly', // Always 'multiple'
    group: 'readonly', // Always 'social'
    provider: 'readonly', // Always 'twitter'
    uri: 'hidden', // Not used for this type
    reward: 'hidden', // Use totalReward instead
    tasks: 'visible', // Dynamic list with Like/Comment/Retweet
    dailyRewards: 'hidden',
    totalReward: 'readonly', // Calculated from task rewards
    username: 'visible',
    tweetId: 'visible',
    icon: 'conditional', // visible if group === 'partner'
    partnerIcon: 'hidden', // Icon field covers this
  },

  defaults: {
    type: 'multiple',
    group: 'social',
    provider: 'twitter',
    resources: {
      ui: {
        button: 'Engage',
        'pop-up': {
          name: 'Social Quests',
          button: 'Engage',
          description: 'Engage with Walme`s Tweet to earn XP',
          'additional-title': 'Connect your X',
          'additional-description': 'Before starting the quest, ensure you connected X account',
        },
      },
      username: '', // walme_io
      // isNew: true,
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
    required: true,
    provider: 'match', // Must have Connect quest for Twitter
  },

  rewardCalculation: {
    source: 'tasks',
    field: 'totalReward',
    readonly: true,
  },

  specialComponents: [
    'TwitterPreview', // For tweet preview (timeout 8-10s, fallback placeholder with link)
    'TasksEditor', // For Like/Comment/Retweet tasks
  ],
};
