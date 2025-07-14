/**
 * @description retryAsync is a function that retries an async operation with configurable retry logic.
 * @param {Function} operation - The async operation to retry.
 * @param {Object} options - Configuration options for retry behavior.
 * @param {number} options.maxAttempts - Maximum number of retry attempts (default: 3).
 * @param {number} options.delay - Delay between retries in milliseconds (default: 1000).
 * @param {Function} options.backoff - Function to calculate delay for each retry (default: exponential backoff).
 * @param {Function} options.shouldRetry - Function to determine if an error should trigger a retry (default: retry all errors).
 * @param {Function} options.onRetry - Callback function called before each retry attempt.
 * @param {Function} options.onMaxAttemptsReached - Callback function called when max attempts are reached.
 * @returns {Promise<T>} A promise that resolves with the result of the operation or rejects after max attempts.
 */

export interface RetryOptions<T> {
  maxAttempts?: number;
  delay?: number;
  backoff?: (attempt: number, baseDelay: number) => number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  onRetry?: (error: unknown, attempt: number) => void;
  onMaxAttemptsReached?: (error: unknown, attempts: number) => void;
}

export const retryAsync = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions<T> = {}
): Promise<T> => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = (attempt: number, baseDelay: number) =>
      baseDelay * Math.pow(2, attempt - 1),
    shouldRetry = () => true,
    onRetry,
    onMaxAttemptsReached,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!shouldRetry(error, attempt)) {
        throw error;
      }

      if (attempt === maxAttempts) {
        onMaxAttemptsReached?.(error, attempt);
        throw error;
      }

      onRetry?.(error, attempt);

      const retryDelay = backoff(attempt, delay);

      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  throw lastError;
};
