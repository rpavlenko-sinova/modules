/**
 * @description fetchWithRetry is a function that performs HTTP requests with configurable retry logic.
 * @param {string | Request} input - The URL or Request object to fetch.
 * @param {RequestInit & RetryOptions} options - Configuration options for both fetch and retry behavior.
 * @param {number} options.maxAttempts - Maximum number of retry attempts (default: 3).
 * @param {number} options.delay - Delay between retries in milliseconds (default: 1000).
 * @param {Function} options.backoff - Function to calculate delay for each retry (default: exponential backoff).
 * @param {Function} options.shouldRetry - Function to determine if an error should trigger a retry (default: retry on network errors and 5xx status codes).
 * @param {Function} options.onRetry - Callback function called before each retry attempt.
 * @param {Function} options.onMaxAttemptsReached - Callback function called when max attempts are reached.
 * @returns {Promise<Response>} A promise that resolves with the Response object or rejects after max attempts.
 */

export interface FetchRetryOptions extends RequestInit {
  maxAttempts?: number;
  delay?: number;
  backoff?: (attempt: number, baseDelay: number) => number;
  shouldRetry?: (
    error: unknown,
    response?: Response,
    attempt?: number
  ) => boolean;
  onRetry?: (error: unknown, response?: Response, attempt?: number) => void;
  onMaxAttemptsReached?: (
    error: unknown,
    response?: Response,
    attempts?: number
  ) => void;
}

const defaultShouldRetry = (error: unknown, response?: Response): boolean => {
  if (!response) {
    return true;
  }

  if (response.status >= 500 && response.status < 600) {
    return true;
  }

  if (response.status === 429) {
    return true;
  }

  return false;
};

export const fetchWithRetry = async (
  input: string | Request,
  options: FetchRetryOptions = {}
): Promise<Response> => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = (attempt: number, baseDelay: number) =>
      baseDelay * Math.pow(2, attempt - 1),
    shouldRetry = defaultShouldRetry,
    onRetry,
    onMaxAttemptsReached,
    ...fetchOptions
  } = options;

  let lastError: unknown;
  let lastResponse: Response | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(input, fetchOptions);
      lastResponse = response;

      if (shouldRetry(null, response, attempt)) {
        if (attempt === maxAttempts) {
          onMaxAttemptsReached?.(null, response, attempt);
          return response;
        }

        onRetry?.(null, response, attempt);
        const retryDelay = backoff(attempt, delay);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;

      if (!shouldRetry(error, lastResponse, attempt)) {
        throw error;
      }

      if (attempt === maxAttempts) {
        onMaxAttemptsReached?.(error, lastResponse, attempt);
        throw error;
      }

      onRetry?.(error, lastResponse, attempt);

      const retryDelay = backoff(attempt, delay);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  throw lastError;
};
