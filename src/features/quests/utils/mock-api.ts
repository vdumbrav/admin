// Mock API configuration from environment variables
export const MOCK_CONFIG = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  latency: parseInt(import.meta.env.VITE_MOCK_LATENCY_MS ?? '300', 10), // Default 300ms
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  failRate: parseFloat(import.meta.env.VITE_MOCK_FAIL_RATE ?? '0'), // Default 0% (no failures)
};

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

