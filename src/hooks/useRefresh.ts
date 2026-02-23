import { useState, useCallback } from 'react';

export interface UseRefreshReturn {
  refreshing: boolean;
  onRefresh: (refreshFunction: () => Promise<void>) => Promise<void>;
}

export function useRefresh(): UseRefreshReturn {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async (refreshFunction: () => Promise<void>) => {
    setRefreshing(true);
    try { await refreshFunction(); }
    catch (error) { console.error('Error during refresh:', error); }
    finally { setRefreshing(false); }
  }, []);

  return { refreshing, onRefresh };
}
