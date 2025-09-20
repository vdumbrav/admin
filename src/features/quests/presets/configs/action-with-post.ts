import type { PresetConfig } from '../types';

export const actionWithPostPresetConfig: PresetConfig = {
  id: 'action-with-post',
  name: 'Action with post',
  description: 'Engage with Twitter posts: like, comment, retweet',
  icon: '💬',

  fieldVisibility: {
    group: 'locked', // Always social per checklist
    provider: 'locked', // Always 'twitter'
    uri: 'hidden', // Not used for this type
    reward: 'hidden', // Use totalReward instead
    tasks: 'visible', // Dynamic list with Like/Comment/Retweet
    dailyRewards: 'hidden',
    totalReward: 'readonly', // Calculated from task rewards
    username: 'visible',
    tweetId: 'visible',
    icon: 'hidden',
    partnerIcon: 'conditional', // visible if group === 'partner'
  },

  lockedFields: {
    provider: 'twitter',
    type: 'multiple',
    group: 'social',
  },

  defaults: {
    type: 'multiple',
    provider: 'twitter',
    resources: {
      ui: {
        button: 'Engage',
        'pop-up': {
          name: 'Social Quests',
          button: 'Engage',
        },
      },
      username: 'walme_io',
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
