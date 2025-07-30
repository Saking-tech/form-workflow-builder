import { StateCreator } from 'zustand';

// Helper function to convert date strings back to Date objects
function reviveDates(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(reviveDates);
  }

  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      
      // Check if the key suggests it's a date field and the value is a string that looks like a date
      if ((key.includes('At') || key.includes('Date')) && 
          typeof value === 'string' && 
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        result[key] = new Date(value);
      } else if (typeof value === 'object') {
        result[key] = reviveDates(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

export function persistStore<T extends object>(key: string, config: StateCreator<T>): StateCreator<T> {
  return (set, get, api) => {
    // Hydrate from localStorage on initialization
    const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    const initialState = stored ? reviveDates(JSON.parse(stored)) : {};

    // Create the store with the config
    const store = config((nextState) => {
      // Wrap the set function to persist to localStorage
      const newState = typeof nextState === 'function' ? nextState(get()) : nextState;
      
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        const currentState = get();
        const persistedState = { ...currentState, ...newState };
        localStorage.setItem(key, JSON.stringify(persistedState));
      }
      
      // Update the store state
      set(newState);
    }, get, api);

    // Return the store with the initial state
    return {
      ...store,
      ...initialState
    };
  };
}