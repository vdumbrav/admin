import { type AxiosRequestConfig } from 'axios';
import { orvalMutator } from './orvalMutator';

// Global variable to store the authenticated mutator function
// This will be set by the AuthProvider
let globalAuthenticatedMutator:
  | (<TResponse>(config: AxiosRequestConfig) => Promise<TResponse>)
  | null = null;

// Function to set the authenticated mutator (called by AuthProvider)
export function setAuthenticatedMutator(
  mutator: <TResponse>(config: AxiosRequestConfig) => Promise<TResponse>,
) {
  globalAuthenticatedMutator = mutator;
}

// Default mutator used by orval-generated code
export async function authenticatedMutator<TResponse>(
  config: AxiosRequestConfig,
): Promise<TResponse> {
  // Use the authenticated mutator if available, otherwise fall back to basic mutator
  if (globalAuthenticatedMutator) {
    return globalAuthenticatedMutator<TResponse>(config);
  }

  // Fallback to basic mutator (no auth)
  return orvalMutator<TResponse>(config);
}
