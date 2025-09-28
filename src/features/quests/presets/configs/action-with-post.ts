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
    tasks: 'visible', // Visible per specification (subtasks = visible for action-with-post)
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
          description: 'Engage with our Tweet to earn XP',
          'additional-title': 'Connect your X',
          'additional-description': 'Before starting the quest, ensure you connected X account',
        },
      },
      username: '', // e.g., company_handle
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
    {
      condition: 'group === "partner"',
      action: 'set resources.ui.pop-up.description = "Engage with our partner\'s Tweet to earn XP"',
      description: 'Update description for partner quests',
    },
    {
      condition: 'tasks.length > 1',
      action: 'set resources.ui.button = "Complete Tasks"',
      description: 'Update button text when multiple tasks are present',
    },
    {
      condition: 'tasks.length === 1',
      action: 'auto-generate resources.ui.button based on task type',
      description: 'Set specific button text for single task type',
      mapping: {
        like: 'Like Tweet',
        comment: 'Comment on Tweet',
        share: 'Share Tweet',
        connect: 'Follow & Engage',
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
    'ChildrenEditor', // For Like/Comment/Retweet tasks
  ],
};
