import { create } from 'zustand';
import { getServices, createService, updateService, deleteService } from '../lib/api/services';
import type { Service } from '../lib/types';

interface ServicesState {
  services: Service[];
  loading: boolean;
  error: string | null;
  fetchServices: () => Promise<void>;
  createService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, service: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
}

export const useServicesStore = create<ServicesState>((set) => ({
  services: [],
  loading: false,
  error: null,
  fetchServices: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getServices();
      set({ services: data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },
  createService: async (service) => {
    set({ loading: true, error: null });
    try {
      await createService(service);
      const data = await getServices();
      set({ services: data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
      throw error; // Re-throw to handle in component
    }
  },
  updateService: async (id, service) => {
    set({ loading: true, error: null });
    try {
      await updateService(id, service);
      const data = await getServices();
      set({ services: data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
      throw error; // Re-throw to handle in component
    }
  },
  deleteService: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteService(id);
      const data = await getServices();
      set({ services: data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
      throw error; // Re-throw to handle in component
    }
  },
}));
