import { useState, useEffect, useCallback } from 'react';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseAsyncState<T> {
  data: T | null;
  status: AsyncStatus;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
}

export interface UseAsyncReturn<T> extends UseAsyncState<T> {
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
  setData: (data: T | null) => void;
}

export function useAsync<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  immediate: boolean = false,
  onSuccess?: (data: T) => void,
  onError?: (error: string) => void
): UseAsyncReturn<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null, status: 'idle', error: null,
    isLoading: false, isSuccess: false, isError: false, isIdle: true,
  });

  const execute = useCallback(async (...args: any[]) => {
    setState(prev => ({ ...prev, status: 'loading', isLoading: true, isSuccess: false, isError: false, isIdle: false, error: null }));
    try {
      const data = await asyncFunction(...args);
      setState({ data, status: 'success', error: null, isLoading: false, isSuccess: true, isError: false, isIdle: false });
      onSuccess?.(data);
    } catch (error: any) {
      const errorMessage = error.message || 'Error desconocido';
      setState({ data: null, status: 'error', error: errorMessage, isLoading: false, isSuccess: false, isError: true, isIdle: false });
      onError?.(errorMessage);
    }
  }, [asyncFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: null, status: 'idle', error: null, isLoading: false, isSuccess: false, isError: false, isIdle: true });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  useEffect(() => {
    if (immediate) { execute(); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, execute, reset, setData };
}
