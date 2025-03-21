import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createAuthSlice, AuthSlice } from './authSlice';
import { createUserSlice, UserSlice } from './userSlice';
import { createJobSlice, JobSlice } from './jobSlice';
import { createTemplateSlice, TemplateSlice } from './templateSlice';
import { createUISlice, UISlice } from './uiSlice';
import { chromeStorageMiddleware } from './chromeStorage';

// Define the store type combining all slices
export type StoreState = AuthSlice & UserSlice & JobSlice & TemplateSlice & UISlice;

// Create the store with all slices and middleware
export const useStore = create<StoreState>()(
  devtools(
    chromeStorageMiddleware((set, get, store) => ({
      ...createAuthSlice(set, get, store),
      ...createUserSlice(set, get, store),
      ...createJobSlice(set, get, store),
      ...createTemplateSlice(set, get, store),
      ...createUISlice(set, get, store),
    })),
    { name: 'JobRefMe-Store' }
  )
);

// Export a helper to get the store state without hooks (useful for background scripts)
export const getStoreState = () => useStore.getState();