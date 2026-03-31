import { useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to persist table state (pagination, filters, sorting) in session storage
 * @param {string} tableName - Unique identifier for the table (e.g., 'applications-list', 'leads-list')
 * @param {object} defaultState - Default state to use if no saved state exists
 * @returns {object} - Methods to save and restore table state
 */
const useTableSessionStorage = (tableName, defaultState = {}) => {
  const storageKey = `table_state_${tableName}`;
  const isRestoredRef = useRef(false);

  /**
   * Save table state to session storage
   */
  const saveTableState = useCallback((state) => {
    try {
      const stateToSave = {
        pagination: state.pagination || {},
        columnFilters: state.columnFilters || [],
        sorting: state.sorting || [],
        globalFilter: state.globalFilter || '',
        timestamp: Date.now()
      };
      
      sessionStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch (error) {
      console.error(`Error saving table state for ${tableName}:`, error);
    }
  }, [storageKey, tableName]);

  /**
   * Restore table state from session storage
   */
  const restoreTableState = useCallback(() => {
    try {
      const savedState = sessionStorage.getItem(storageKey);
      
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        isRestoredRef.current = true;
        return parsedState;
      }
      
      return defaultState;
    } catch (error) {
      console.error(`Error restoring table state for ${tableName}:`, error);
      return defaultState;
    }
  }, [storageKey, tableName, defaultState]);

  /**
   * Clear table state from session storage
   */
  const clearTableState = useCallback(() => {
    try {
      sessionStorage.removeItem(storageKey);
      isRestoredRef.current = false;
    } catch (error) {
      console.error(`Error clearing table state for ${tableName}:`, error);
    }
  }, [storageKey, tableName]);

  /**
   * Check if state was restored
   */
  const isRestored = useCallback(() => {
    return isRestoredRef.current;
  }, []);

  return {
    saveTableState,
    restoreTableState,
    clearTableState,
    isRestored
  };
};

export default useTableSessionStorage;
