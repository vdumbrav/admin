import type { PresetConfig } from '../types';

export const actionWithPostPresetConfig: PresetConfig = {
  id: 'action-with-post',
  name: 'Action with post',

  fieldVisibility: {
    type: 'hidden', // Always 'multiple' - hidden per spec
    group: 'visible', // Visible but auto-reset to 'social'
    provider: 'readonly', // Always 'twitter' (readonly per spec)
    uri: 'visible', // Tweet URL - visible, auto-parsed to username + tweetId
    reward: 'hidden', // Use totalReward instead
    tasks: 'conditional', // Only visible for multiple type
    dailyRewards: 'hidden', // Hidden per specification
    totalReward: 'readonly', // Calculated from task rewards
    username: 'hidden', // Parsed from uri field
    tweetId: 'hidden', // Parsed from uri field
    icon: 'conditional', // Visible if group === 'partner'
    partnerIcon: 'hidden', // Icon field covers this
    buttonText: 'hidden', // Handled by business rules based on tasks
    popupDescription: 'hidden', // Auto-generated based on tasks
    popupButton: 'hidden', // Handled by business rules based on tasks
    repeatable: 'hidden', // Not applicable for action-with-post quests
    badge: 'visible',
    visible: 'visible',
  },

  defaults: {
    type: 'multiple',
    group: 'social',
    provider: 'twitter',
    badge: true,
    visible: false,
    child: [
      {
        title: '',
        description: '',
        type: 'like',
        group: 'social',
        provider: 'twitter',
        order_by: 0,
        reward: 0,
        uri: '',
        resources: {
          username: '',
          tweetId: '',
          ui: {
            'pop-up': {
              static: '',
            },
          },
        },
      },
    ],
  },

  businessRules: [],

  rewardCalculation: {
    source: 'tasks',
    field: 'totalReward',
    readonly: true,
  },

  specialComponents: [
    'TwitterPreview', // For tweet preview (timeout 8-10s, fallback placeholder with link)
    'ChildrenEditor', // For Like/Comment/Retweet tasks
  ],
};
