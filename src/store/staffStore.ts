import { create } from 'zustand';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../lib/api/staff';
import type { Staff } from '../lib/types';

interface StaffState {
  staff: Staff[];
  loading: boolean;
  error: string | null;
  fetchStaff: () => Promise<void>;
  createStaff: (staff: Omit<Staff, 'id'>, serviceIds: string[]) => Promise<void>;
  updateStaff: (id: string, staff: Partial<Staff>, serviceIds?: string[]) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
}

export const useStaffStore = create<StaffState>((set) => ({
  staff: [],
  loading: false,
  error: null,
  fetchStaff: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getStaff();
      set({ staff: data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },
  createStaff: async (staff, serviceIds) => {
    set({ loading: true, error: null });
    try {
      await createStaff(staff, serviceIds);
      const data = await getStaff();
      set({ staff: data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
      throw error; // Re-throw to handle in component
    }
  },
  updateStaff: async (id, staff, serviceIds) => {
    set({ loading: true, error: null });
    try {
      await updateStaff(id, staff, serviceIds);
      const data = await getStaff();
      set({ staff: data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
      throw error; // Re-throw to handle in component
    }
  },
  deleteStaff: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteStaff(id);
      const data = await getStaff();
      set({ staff: data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
      throw error; // Re-throw to handle in component
    }
  },
}));
