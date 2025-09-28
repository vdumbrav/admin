import type { PresetConfig } from '../types';

export const actionWithPostPresetConfig: PresetConfig = {
  id: 'action-with-post',
  name: 'Action with post',

  fieldVisibility: {
    type: 'readonly', // Always 'multiple'
    group: 'readonly', // Always 'social'
    provider: 'readonly', // Always 'twitter' (readonly per spec)
    uri: 'visible', // Required for main post URL in action-with-post quests
    reward: 'hidden', // Use totalReward instead
    tasks: 'conditional', // Only visible for multiple type
    dailyRewards: 'hidden', // Hidden per specification
    totalReward: 'readonly', // Calculated from task rewards
    username: 'hidden', // Used only in child tasks for multiple type
    tweetId: 'hidden', // Used only in child tasks for multiple type
    icon: 'conditional', // Conditional per specification (visible if group === 'partner')
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
  },

  businessRules: [],

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
    'ChildrenEditor', // For Like/Comment/Retweet tasks
  ],
};
