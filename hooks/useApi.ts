import { useState, useCallback, useEffect, useRef } from 'react';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequestOptions<TBody = any> extends Omit<RequestInit, 'body'> {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: TBody;
  queryParams?: Record<string, string>;
}

export interface UseApiConfig {
  autoExecute?: boolean;
}

export function useApi<TData = any, TBody = any>(
  url: string,
  options: ApiRequestOptions<TBody> = {},
  config: UseApiConfig = {}
) {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Keep latest refs of parameters to prevent unnecessary hook re-creations and keep dependency arrays minimal
  const optionsRef = useRef(options);
  const configRef = useRef(config);
  optionsRef.current = options;
  configRef.current = config;

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (overrideOptions: ApiRequestOptions<TBody> = {}): Promise<TData> => {
      // Cancel previous pending request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setLoading(true);
      setError(null);

      const mergedOptions = { ...optionsRef.current, ...overrideOptions };
      const {
        method = 'GET',
        headers = {},
        body,
        queryParams,
        ...restFetchOptions
      } = mergedOptions;

      // Setup Headers
      const requestHeaders = new Headers(headers);
      if (!requestHeaders.has('Content-Type') && body && !(body instanceof FormData)) {
        requestHeaders.set('Content-Type', 'application/json');
      }

      // Build url with query parameters
      let finalUrl = url;
      if (queryParams) {
        const searchParams = new URLSearchParams();
        Object.entries(queryParams).forEach(([key, val]) => {
          if (val !== undefined && val !== null) {
            searchParams.append(key, String(val));
          }
        });
        const queryString = searchParams.toString();
        if (queryString) {
          finalUrl += `${finalUrl.includes('?') ? '&' : '?'}${queryString}`;
        }
      }

      // Prepare request body
      let requestBody: any = undefined;
      if (body !== undefined) {
        requestBody = body instanceof FormData ? body : JSON.stringify(body);
      }

      try {
        const response = await fetch(finalUrl, {
          method,
          headers: requestHeaders,
          body: requestBody,
          signal: abortController.signal,
          ...restFetchOptions,
        });

        let result: any = null;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            result = await response.json();
          } else {
            result = await response.text();
          }
        } catch {
          // Ignore parse errors so that we fall back to HTTP status messages
        }

        if (!response.ok) {
          throw new Error(result?.message || `HTTP Error ${response.status}: ${response.statusText}`);
        }

        setData(result as TData);
        return result as TData;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // If aborted, do not throw or change state to avoid component interference
          throw err;
        }
        const apiError = err instanceof Error ? err : new Error(String(err));
        setError(apiError);
        throw apiError;
      } finally {
        // Only turn off loading if the call wasn't aborted
        if (!abortControllerRef.current?.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [url]
  );

  // Auto execution for GET requests on mount (if configured)
  useEffect(() => {
    if (configRef.current.autoExecute) {
      execute().catch(() => { });
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [execute]);

  return {
    data,
    error,
    loading,
    execute,
    reset: useCallback(() => {
      setData(null);
      setError(null);
      setLoading(false);
    }, []),
  };
}
