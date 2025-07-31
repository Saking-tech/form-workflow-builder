import { create } from 'zustand';
import { Request } from '@/types';
import { persistStore } from '@/lib/persistStore';

interface RequestStore {
  requests: Request[];
  currentRequest: Request | null;
  addRequest: (request: Request) => void;
  updateRequest: (id: string, updates: Partial<Request>) => void;
  deleteRequest: (id: string) => void;
  setCurrentRequest: (request: Request | null) => void;
  updateRequestProgress: (id: string, step: number, formData: any) => void;
  completeRequest: (id: string) => void;
  resetRequest: (id: string) => void;
}

export const useRequestStore = create<RequestStore>(
  persistStore<RequestStore>('requestStore', (set, get) => ({
  requests: [],
  currentRequest: null,
  
  addRequest: (request) => set((state) => ({
    requests: [...state.requests, request]
  })),
  
  updateRequest: (id, updates) => set((state) => ({
    requests: state.requests.map(request => 
      request.id === id ? { ...request, ...updates, updatedAt: new Date() } : request
    )
  })),
  
  deleteRequest: (id) => set((state) => ({
    requests: state.requests.filter(request => request.id !== id)
  })),
  
  setCurrentRequest: (request) => set({ currentRequest: request }),
  
  updateRequestProgress: (id, step, formData) => set((state) => ({
    requests: state.requests.map(request => 
      request.id === id 
        ? { 
            ...request, 
            currentStep: step,
            formData: { ...request.formData, ...formData },
            updatedAt: new Date()
          }
        : request
    )
  })),
  
  completeRequest: (id) => set((state) => ({
    requests: state.requests.map(request => 
      request.id === id 
        ? { 
            ...request, 
            status: 'completed',
            updatedAt: new Date()
          }
        : request
    )
  })),
  
  resetRequest: (id) => set((state) => ({
    requests: state.requests.map(request => 
      request.id === id 
        ? { 
            ...request, 
            status: 'pending',
            currentStep: 0,
            updatedAt: new Date()
          }
        : request
    )
  }))
})));