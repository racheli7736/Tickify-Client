import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { toApiError, type ApiError } from '../api/errors';

interface QueryState<T> {
  /** Identifies the request this state belongs to. */
  key: string;
  data?: T;
  error?: ApiError;
}

export interface QueryResult<T> {
  /** The last successfully loaded data. It stays while a newer request is loading, so lists do not flash. */
  data: T | undefined;
  error: ApiError | undefined;
  /** True while the request for the current `key` has not answered yet. */
  loading: boolean;
  reload: () => void;
}

/**
 * Loads data from the API whenever `key` changes (put every input of the request into the key).
 * Cancels the previous request, so a slow old answer can never overwrite a newer one.
 */
export function useApiQuery<T>(key: string, fetcher: (signal: AbortSignal) => Promise<T>): QueryResult<T> {
  const [state, setState] = useState<QueryState<T>>({ key: '' });
  const [reloads, setReloads] = useState(0);
  const requestKey = `${key}#${reloads}`;

  useEffect(() => {
    const controller = new AbortController();
    fetcher(controller.signal)
      .then((data) => setState({ key: requestKey, data }))
      .catch((error: unknown) => {
        if (axios.isCancel(error)) return;
        setState((previous) => ({ key: requestKey, data: previous.data, error: toApiError(error) }));
      });
    return () => controller.abort();
    // `fetcher` is rebuilt on every render; the request is fully described by `requestKey`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const reload = useCallback(() => setReloads((count) => count + 1), []);

  const settled = state.key === requestKey;
  return {
    data: state.data,
    error: settled ? state.error : undefined,
    loading: !settled,
    reload,
  };
}
