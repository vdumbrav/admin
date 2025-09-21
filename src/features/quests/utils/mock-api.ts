import type { Quest } from '../data/types';

// Mock API configuration from environment variables
export const MOCK_CONFIG = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  latency: parseInt(import.meta.env.VITE_MOCK_LATENCY_MS ?? '300', 10), // Default 300ms
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  failRate: parseFloat(import.meta.env.VITE_MOCK_FAIL_RATE ?? '0'), // Default 0% (no failures)
};

// Mock quest storage for development
const MOCK_QUESTS = new Map<number, Quest>();
let nextId = 1000;

/**
 * Simulate network latency and random failures
 */
const simulateAPICall = async <T>(operation: () => T | Promise<T>): Promise<T> => {
  // Simulate latency
  if (MOCK_CONFIG.latency > 0) {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), MOCK_CONFIG.latency);
    });
  }

  // Simulate random failures
  if (MOCK_CONFIG.failRate > 0 && Math.random() < MOCK_CONFIG.failRate) {
    const errors = [
      'Network timeout',
      'Server error (500)',
      'Service unavailable (503)',
      'Rate limit exceeded (429)',
      'Conflict - resource was modified (409)',
    ];
    const randomError = errors[Math.floor(Math.random() * errors.length)];
    throw new Error(`Mock API Error: ${randomError}`);
  }

  return await operation();
};

/**
 * Mock create quest API
 */
export const mockCreateQuest = async (data: Partial<Quest>): Promise<Quest> => {
  return simulateAPICall(async () => {
    const newQuest = {
      id: nextId++,
      title: data.title ?? 'Untitled Quest',
      description: data.description ?? '',
      type: data.type ?? 'connect',
      group: data.group ?? 'social',
      provider: data.provider ?? 'twitter',
      uri: data.uri,
      reward: data.reward ?? 0,
      visible: data.visible ?? true,
      resources: data.resources ?? {
        ui: {
          button: 'Join',
          'pop-up': {
            name: 'Social Quests',
            button: 'Join',
            description: '',
          },
        },
      },
      child: data.child ?? [],
      iterator: data.iterator,
      ...data,
    };

    // Store in mock storage
    MOCK_QUESTS.set(newQuest.id, newQuest as Quest);

    return newQuest as Quest;
  });
};

/**
 * Mock update quest API
 */
export const mockUpdateQuest = async (id: number, data: Partial<Quest>): Promise<Quest> => {
  return simulateAPICall(async () => {
    const existing = MOCK_QUESTS.get(id);
    if (!existing) {
      throw new Error(`Quest with id ${id} not found`);
    }

    // Simulate 409 conflict occasionally (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Conflict: Quest was modified by another user. Please reload and try again.');
    }

    const updated: Quest = {
      ...existing,
      ...data,
      id, // Ensure ID doesn't change
    };

    MOCK_QUESTS.set(id, updated);
    return updated;
  });
};

/**
 * Mock delete quest API
 */
export const mockDeleteQuest = async (id: number): Promise<void> => {
  return simulateAPICall(async () => {
    if (!MOCK_QUESTS.has(id)) {
      throw new Error(`Quest with id ${id} not found`);
    }

    MOCK_QUESTS.delete(id);
  });
};

/**
 * Mock toggle visibility API
 */
export const mockToggleVisibility = async (id: number, visible: boolean): Promise<Quest> => {
  return simulateAPICall(async () => {
    const existing = MOCK_QUESTS.get(id);
    if (!existing) {
      throw new Error(`Quest with id ${id} not found`);
    }

    const updated: Quest = {
      ...existing,
      visible,
    };

    MOCK_QUESTS.set(id, updated);
    return updated;
  });
};

/**
 * Mock media upload API
 */
export const mockUploadMedia = async (file: File): Promise<string> => {
  return simulateAPICall(async () => {
    // Simulate file validation
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      throw new Error('File too large. Maximum size is 5MB.');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only images are allowed.');
    }

    // Create a real blob URL for the uploaded file
    const url = URL.createObjectURL(file);

    // Return the actual object URL for preview functionality
    return url;
  });
};

/**
 * Initialize mock storage with some sample quests
 */
export const initializeMockStorage = () => {
  if (MOCK_QUESTS.size === 0) {
    console.log('🎭 Initializing mock quest storage...');
    console.log(
      `📊 Mock API config: latency=${MOCK_CONFIG.latency}ms, failRate=${(MOCK_CONFIG.failRate * 100).toFixed(1)}%`,
    );
  }
};

/**
 * Get all mock quests (for development debugging)
 */
export const getMockQuests = (): Quest[] => {
  return Array.from(MOCK_QUESTS.values());
};

/**
 * Clear mock storage
 */
export const clearMockStorage = () => {
  MOCK_QUESTS.clear();
  nextId = 1000;
};
