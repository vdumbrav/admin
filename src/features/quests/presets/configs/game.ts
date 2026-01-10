import type { PresetConfig } from '../types';

/**
 * Game Quest Preset
 * For creating game-related quests (Flappy Bird, TapCard, Snake, etc.)
 * with ad management and XP rewards
 */
export const gamePresetConfig: PresetConfig = {
  id: 'game',
  name: 'Game Quest',

  fieldVisibility: {
    type: 'visible', // Allow selecting game quest type
    group: 'readonly', // Fixed to 'game' group
    provider: 'hidden', // No provider needed for game quests
    uri: 'hidden', // No URL needed
    reward: 'visible', // XP reward
    tasks: 'hidden', // No subtasks
    dailyRewards: 'hidden', // No daily rewards map
    totalReward: 'hidden',
    username: 'hidden',
    tweetId: 'hidden',
    icon: 'visible', // Allow custom icon
    partnerIcon: 'hidden',
    buttonText: 'visible', // Button text for the quest
    popupDescription: 'visible', // Description in popup
    popupButton: 'visible', // Button in popup
    repeatable: 'visible', // Game quests can be repeatable (daily)
    badge: 'visible',
    visible: 'visible',
    // Ad management fields
    adsWebBlockId: 'visible',
    adsTelegramBlockId: 'visible',
    adsEnabled: 'visible',
  },

  defaults: {
    type: 'flappy-bird-wlm', // Default to Flappy Bird
    group: 'game', // Always game group
    provider: undefined,
    badge: true,
    visible: true,
    resources: {
      isNew: true,
      ui: {
        button: 'Play',
        'pop-up': {
          name: 'Game Quest',
          button: 'Play Now',
          description: 'Play the game to earn XP rewards',
        },
      },
      // Ad configuration defaults
      ads: {
        enabled: true,
        web: {
          block_id: '',
          type: 'rewarded',
        },
        telegram: {
          block_id: '',
          type: 'rewarded',
        },
      },
    },
  },

  businessRules: [],

  specialComponents: ['adsConfig'],
};
